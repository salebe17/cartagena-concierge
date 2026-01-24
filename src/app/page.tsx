"use client";

import dynamic from 'next/dynamic';

// Importamos el componente de forma dinámica y DESACTIVAMOS SSR
// Esto previene errores de "window not defined" con Thirdweb y asegura consistencia visual inicial
const HostLanding = dynamic(() => import('@/components/HostLanding'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-200"></div>
    </div>
  )
});

export default function Home() {
  return (
    <HostLanding />
  );
}
