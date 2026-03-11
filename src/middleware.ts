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
  try {
    return await doMiddleware(request);
  } catch (error: any) {
    console.error("EDGE MIDDLEWARE ERROR:", error);
    return new NextResponse(
      `<html>
        <body style="font-family: monospace; background: #111; color: #fff; padding: 2rem;">
          <h1 style="color: #ff3333">EDGE MIDDLEWARE CRASH</h1>
          <h2>${error.message}</h2>
          <pre style="background: #222; padding: 1rem; overflow-x: auto;">${error.stack}</pre>
        </body>
      </html>`,
      { status: 500, headers: { "content-type": "text/html" } }
    );
  }
}

async function doMiddleware(request: NextRequest) {
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
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fallback.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fallback_anon_key",
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

  // ----- EDGE RUNTIME OPTIMIZATION -----
  // In Vercel Edge Runtime, we cannot easily query the database directly using `supabase.from('profiles')`
  // if not using a connection pooler. To prevent the MIDDLEWARE_INVOCATION_FAILED 500 error,
  // we rely strictly on the JWT session claims for routing protection at the Edge.
  let user = null;
  let userRole = null;

  if (process.env.NODE_ENV !== "production" && request.cookies.get("x-playwright-mock-role")?.value) {
    user = { id: "mock-user" };
    userRole = request.cookies.get("x-playwright-mock-role")?.value;
  } else {
    const { data: authData } = await supabase.auth.getUser();
    user = authData?.user;
    // We assume the role is injected into the JWT app_metadata for Edge compat (best practice)
    userRole = user?.app_metadata?.role || "client"; // Fallback to client
    
    // Developer Rescue Override
    if (process.env.NODE_ENV === "development" && userRole === "client") {
      userRole = "admin";
    }
  }

  // 1. Protect Admin Routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login?next=/admin/dashboard", request.url));
    }
    if (userRole !== "admin") {
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
      return NextResponse.redirect(new URL("/login?next=/client/dashboard", request.url));
    }
  }

  // 4. Protect Technician Routes
  if (request.nextUrl.pathname.startsWith("/technician")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login?next=/technician/dashboard", request.url));
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
