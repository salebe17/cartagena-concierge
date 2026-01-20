"use client";

import dynamic from 'next/dynamic';
import { ThirdwebProvider } from "thirdweb/react";

// Importamos el componente de forma dinámica y DESACTIVAMOS SSR
// Esto previene errores de "window not defined" o hidratación con Thirdweb
const ConciergeTerminal = dynamic(() => import('@/components/ConciergeTerminal'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  )
});

export default function Home() {
  return (
    <ThirdwebProvider>
      <ConciergeTerminal />
    </ThirdwebProvider>
  );
}
