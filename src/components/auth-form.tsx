"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fix for environment variable typo (accidental equals sign)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
    /^=/,
    "",
  ).trim();

  // Create Supabase Client
  const supabase = createBrowserClient(
    supabaseUrl!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Native App Deep Link Listener
  useEffect(() => {
    let appListener: any;
    if (Capacitor.isNativePlatform()) {
      // Setup the listener
      appListener = App.addListener("appUrlOpen", async (event) => {
        console.log("CAPACITOR APP URL OPEN DETECTED: ", event.url);
        
        // Safely extract the code query param
        const codeMatch = event.url.match(/code=([^&]+)/);
        
        if (codeMatch && codeMatch[1]) {
          const code = codeMatch[1];
          console.log("CAPACITOR EXTRACTED CODE: ", code);
          
          // Force close the Native Custom Tab immediately
          await Browser.close();
          setLoading(true);

          try {
            // Process the PKCE session completely Client-Side (bypasses Next.js API Routes)
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error("CAPACITOR SESSION EXCHANGE ERROR: ", error);
              toast({ title: "Error", description: error.message, variant: "destructive" });
              setLoading(false);
              return;
            }

            console.log("CAPACITOR SESSION SUCCESS, Fetching Role...");
            if (data?.user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();

              if (profile?.role === "technician") {
                router.push("/technician/dashboard");
              } else if (profile?.role === "admin") {
                router.push("/admin/dashboard");
              } else {
                router.push("/client/dashboard");
              }
            }
          } catch (e) {
            console.error("CAPACITOR FATAL ERROR: ", e);
          } finally {
            setLoading(false);
          }
        }
      });
    }

    return () => {
      // Cleanup listener when component unmounts
      if (appListener) {
        appListener.then((listener: any) => listener.remove());
      }
    };
  }, [supabase, router, toast]);

  const handleGoogleLogin = async () => {
    // Determine the exact Redirect URL relying on the environment
    const redirectURL = Capacitor.isNativePlatform()
      ? `https://cartagena-concierge-g6tt.vercel.app/auth/callback?is_native=true` // Hit Vercel Bouncer first
      : `${window.location.origin}/auth/callback`;

    console.log("CAPACITOR OAUTH INITIATED. Redirect URI: ", redirectURL);

    if (Capacitor.isNativePlatform()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectURL,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        console.error("CAPACITOR OAUTH ERROR:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      if (data?.url) {
        console.log("CAPACITOR LAUNCHING CUSTOM TAB OAUTH URL: ", data.url);
        await Browser.open({ url: data.url });
      }
    } else {
      // Standard Web Flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectURL,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        console.error("WEB GOOGLE OAUTH ERROR:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStep("code");
      toast({
        title: "Code Sent",
        description: "Check your email for the verification code.",
      });
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else if (data?.user) {
      // Fetch role to determine correct dashboard
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      setLoading(false);
      if (profile?.role === "technician") {
        router.push("/technician/dashboard");
      } else if (profile?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/client/dashboard");
      }
    } else {
      setLoading(false);
      router.push("/client/dashboard");
    }
  };

  return (
    <div className="w-full">
      {/* Removed Card Wrapper to blend with Login Page */}

      <div className="space-y-6">
        <Button
          variant="outline"
          className="w-full h-12 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all relative"
          onClick={handleGoogleLogin}
        >
          <svg
            className="mr-3 h-5 w-5"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Continuar con Google
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#F9FAFB] px-2 text-zinc-400 font-medium tracking-wider">
              OR
            </span>
          </div>
        </div>

        {step === "email" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-700 font-bold text-xs uppercase tracking-wide"
              >
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] rounded-xl text-gray-900 transition-all font-medium"
              />
            </div>
            <Button
              className="w-full h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black font-extrabold rounded-xl transition-all shadow-lg shadow-[rgba(198,255,0,0.2)]"
              onClick={handleSendCode}
              disabled={loading || !email}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Continuar con Email"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-gray-700 font-bold text-xs uppercase tracking-wide"
              >
                Código de Verificación
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="0 0 0 0 0 0"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-14 bg-gray-50 border-gray-200 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] rounded-xl text-center tracking-[0.5em] text-2xl font-bold text-gray-900"
                maxLength={6}
              />
              <p className="text-xs text-gray-400 text-center font-medium">
                Enviamos el código a {email}
              </p>
            </div>
            <Button
              className="w-full h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black font-extrabold rounded-xl transition-all shadow-lg shadow-[rgba(198,255,0,0.2)]"
              onClick={handleVerifyCode}
              disabled={loading || !otp}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Verificar e Ingresar"
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl"
              onClick={() => setStep("email")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Cambiar correo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
