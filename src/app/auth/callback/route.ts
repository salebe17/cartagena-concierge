import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const isNativeApp = searchParams.get("is_native") === "true";

  if (isNativeApp && code) {
    // NATIVE APP BOUNCER: 
    // Do NOT consume the PKCE Token on the Vercel Edge Server. 
    // Instead, return an HTML DOM `<script>` that forces the Android OS to launch the Intent.
    // This bypasses Chrome Custom Tab 302 redirect blocks and Supabase Cloud wildcard limitations.
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
             body { background: #050505; color: #FFFFFF; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; flex-direction: column; }
             .loader { border: 4px solid rgba(198,255,0,0.1); border-left-color: #C6FF00; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px;}
             @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <h2>Conectando Aplicación...</h2>
          <script>
            // Bounce the un-consumed PKCE code directly into the Capacitor intent
            window.location.href = 'com.cartagenaconcierge.app://auth/callback?code=${code}';
          </script>
        </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  }

  // STANDARD WEB FLOW
  if (code) {
    const cookieStore = await cookies();
    // Sanitize URL (Fix for common copy-paste error where '=' is included)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
      /^=/,
      "",
    ).trim();

    const supabase = createServerClient(
      supabaseUrl!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      },
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next === "/dashboard") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          let targetRoute = "/client/dashboard";
          if (profile?.role === "technician") targetRoute = "/technician/dashboard";
          if (profile?.role === "admin") targetRoute = "/admin/dashboard";

          return NextResponse.redirect(new URL(targetRoute, request.url));
        }
      }
      
      const bounceRoute = next === "/dashboard" ? "/client/dashboard" : next;
      return NextResponse.redirect(new URL(bounceRoute, request.url));
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/error", request.url));
}
