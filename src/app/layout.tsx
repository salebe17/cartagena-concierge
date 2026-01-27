import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { ClientProviders } from "@/components/ClientProviders";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const inter = Inter({ subsets: ["latin"] });

// Force dynamic because we use cookies in the layout for auth checking
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cartagena Concierge | Elite Private Services",
  description: "Logística privada de lujo en Cartagena. Limpieza, mantenimiento y concierge exclusivo para propietarios.",
  keywords: ["Cartagena", "Concierge", "Luxury", "Cleaning", "Maintenance", "Private Service"],
  openGraph: {
    title: "Cartagena Concierge | Elite Private Services",
    description: "Gestión de propiedades y servicios de estilo de vida en Cartagena de Indias.",
    url: "https://cartagena-concierge.vercel.app",
    siteName: "Cartagena Concierge",
    images: [
      {
        url: "https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=80&w=1200", // Cartagena Streets
        width: 1200,
        height: 630,
        alt: "Cartagena Architecture",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cartagena Concierge | Elite Private Services",
    description: "Logística privada de lujo en Cartagena.",
    images: ["https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=80&w=1200"],
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Concierge",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  /*
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("RootLayout: Supabase init failed", error);
    // Fail gracefully: User remains null, app continues to render
  }
  */

  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self' https://*.supabase.co https://*.stripe.com; img-src 'self' blob: data: https://*.supabase.co; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;" />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <ErrorBoundary>
            {user && (
              <div className="fixed top-4 right-4 z-50">
                <LogoutButton />
              </div>
            )}
            {children}
            <Toaster />
          </ErrorBoundary>
        </ClientProviders>
      </body>
    </html>
  );
}
