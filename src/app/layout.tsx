import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cartagena Concierge | Private Cash Delivery",
  description: "Servicio exclusivo de entrega de efectivo a domicilio en Cartagena. Seguro, rápido y discreto. 24/7.",
  openGraph: {
    title: "Cartagena Concierge | Private Service",
    description: "Solicita efectivo a domicilio en minutos. Seguridad y discreción garantizada.",
    url: "https://cartagena-concierge.vercel.app",
    siteName: "Cartagena Concierge",
    images: [
      {
        url: "https://images.unsplash.com/photo-1621504450168-b8c437532b3a?q=80&w=1200&auto=format&fit=crop", // Abstract Black/Gold Texture
        width: 1200,
        height: 630,
        alt: "Cartagena Concierge Premium Service",
      },
    ],
    locale: "es_CO",
    type: "website",
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
  themeColor: "#000000",
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {user && (
          <div className="fixed top-4 right-4 z-50">
            <LogoutButton />
          </div>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
