import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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

          // If this originated from the Native App deep link, do NOT load the dashboard 
          // inside the Chrome Custom Tab. Instead, bounce it back to the host App.
          const isNativeApp = request.url.includes("is_native=true");

          if (isNativeApp) {
             const html = `
              <html>
               <body>
                 <script>
                   window.location.href = 'com.cartagenaconcierge.app://${targetRoute.replace(/^\//, "")}';
                 </script>
               </body>
              </html>
             `;
             return new NextResponse(html, {
               headers: { 'Content-Type': 'text/html' }
             });
          }

          return NextResponse.redirect(new URL(targetRoute, request.url));
        }
      }
      
      const bounceRoute = next === "/dashboard" ? "/client/dashboard" : next;
      const isNativeAppFallback = request.url.includes("is_native=true");
      if (isNativeAppFallback) {
         const html = `<html><body><script>window.location.href = 'com.cartagenaconcierge.app://${bounceRoute.replace(/^\//, "")}';</script></body></html>`;
         return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
      }

      return NextResponse.redirect(new URL(bounceRoute, request.url));
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/error", request.url));
}
