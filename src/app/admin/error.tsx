'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin Route Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-xl max-w-md text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Algo salió mal</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    El panel de administración encontró un error inesperado al cargar.
                </p>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-6 text-left">
                    <p className="text-[10px] font-mono text-gray-400 break-all">
                        Digest: {error.digest}
                    </p>
                    <p className="text-[10px] font-mono text-rose-400 mt-1">
                        {error.message}
                    </p>
                </div>
                <Button
                    onClick={() => reset()}
                    className="w-full bg-gray-900 text-white font-bold rounded-xl h-12"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Reintentar
                </Button>
            </div>
        </div>
    );
}
