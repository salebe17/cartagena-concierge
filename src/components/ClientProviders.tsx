'use client';

import { useEffect, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    if (Capacitor.isNativePlatform()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^=/, "").trim();
      const supabase = createBrowserClient(
        supabaseUrl!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const listener = CapacitorApp.addListener("appUrlOpen", async (event) => {
        console.log("GLOBAL CAPACITOR LINK INTERCEPTED: ", event.url);
        
        // Always attempt to obliterate the Custom Tab
        try {
          await Browser.close();
        } catch (e) {
          console.error("Failed closing browser:", e);
        }

        const codeMatch = event.url.match(/code=([^&]+)/);
        if (codeMatch && codeMatch[1]) {
          const code = codeMatch[1];
          console.log("EXCHANGING GLOBAL NATIVE CODE");

          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", data.user.id)
              .single();

            if (profile?.role === "technician") router.push("/technician/dashboard");
            else if (profile?.role === "admin") router.push("/admin/dashboard");
            else router.push("/client/dashboard");
          } else {
             console.error("GLOBAL NATIVE EXCHANGE ERROR:", error);
          }
        }
      });

      return () => {
        listener.then((l) => l.remove());
      };
    }
  }, [router]);

  if (!mounted) return null;

  return <>{children}</>;
}
