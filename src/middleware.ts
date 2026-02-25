import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis for Edge Rate Limiting
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

// Create a new ratelimiter, that allows 10 requests per 10 seconds per IP
const ratelimit = redis
  ? new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
  })
  : null;

export async function middleware(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  const headersWidthId = new Headers(request.headers);
  headersWidthId.set("x-correlation-id", correlationId);

  let response = NextResponse.next({
    request: {
      headers: headersWidthId,
    },
  });

  // Also set it on response so client can see it
  response.headers.set("x-correlation-id", correlationId);

  // Secure Headers (CSP Level 3 & HSTS)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com;",
  );

  // Upstash Edge Rate Limiting (Phase 4 Master Plan)
  if (ratelimit) {
    // NextRequest.ip is deprecated in Next 14/15 edge runtime. Use standard headers.
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_${ip}`,
    );

    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "DDoS protection triggered.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 0. Maintenance Mode Check
  // Runs on ALL routes except /admin, /auth, /api/auth
  if (
    !request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    try {
      const { data: settings } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .single();

      const maintenance = settings?.value;
      // Allow ONLY admin role to bypass
      if (maintenance?.enabled) {
        let isAdmin = false;
        if (user) {
          // Check profile role
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (profile?.role === "admin") isAdmin = true;
        }

        if (!isAdmin) {
          return new NextResponse(
            `<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f9fafb;color:#111;">
                            <div style="text-align:center">
                                <h1 style="font-size:3rem;margin-bottom:1rem;">🚧</h1>
                                <h2>${maintenance.message || "Mantenimiento en Progreso"}</h2>
                                <p>Estamos mejorando la plataforma. Volvemos en breve.</p>
                            </div>
                        </body></html>`,
            { status: 503, headers: { "content-type": "text/html" } },
          );
        }
      }
    } catch {
      // Failsafe: If DB down, assume NO maintenance to avoid lockout
      // console.error("Middleware Maintenance Check Failed", error);
    }
  }

  // 1. Protect Admin Routes (Phase 11: Command Center)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login?next=/admin/dashboard", request.url));
    }

    // Strict Role Enforcement
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      // If a standard Client or Technician tries to access the Command Center, kick them to client dashboard
      return NextResponse.redirect(new URL("/client/dashboard", request.url));
    }
  }

  // 2. Protect Host Routes (legacy)
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Protect Client Routes
  if (request.nextUrl.pathname.startsWith("/client")) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/login?next=/client/dashboard", request.url),
      );
    }
  }

  // 4. Protect Technician Routes
  if (request.nextUrl.pathname.startsWith("/technician")) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/login?next=/technician/dashboard", request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (if accessible directly)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
