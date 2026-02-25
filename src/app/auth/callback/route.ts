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

          if (profile?.role === "technician")
            return NextResponse.redirect(
              new URL("/technician/dashboard", request.url),
            );
          if (profile?.role === "admin")
            return NextResponse.redirect(
              new URL("/admin/dashboard", request.url),
            );
          return NextResponse.redirect(
            new URL("/client/dashboard", request.url),
          );
        }
      }
      return NextResponse.redirect(
        new URL(
          next === "/dashboard" ? "/client/dashboard" : next,
          request.url,
        ),
      );
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/error", request.url));
}
