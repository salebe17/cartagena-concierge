import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPinOff, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mb-8 rotate-12 shadow-sm border border-gray-100">
                <MapPinOff size={48} className="text-gray-300" />
            </div>

            <h1 className="text-8xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Destino Desconocido</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                La página que buscas no está en nuestro mapa. Permítenos llevarte de vuelta a la civilización.
            </p>

            <Link href="/">
                <Button className="bg-black text-white font-bold rounded-2xl h-14 px-8 text-lg hover:scale-105 transition-transform">
                    <Home size={20} className="mr-2" />
                    Regresar a Casa
                </Button>
            </Link>
        </div>
    );
}
