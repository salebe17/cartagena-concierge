'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CloudOff, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard User Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"
            >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                    <CloudOff size={40} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-2">Conexión Interrumpida</h2>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                    No pudimos cargar tus datos en este momento. Puede ser un problema temporal de red o una actualización del sistema.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-black text-white font-bold rounded-xl h-12 hover:bg-gray-800 transition-colors"
                    >
                        <RefreshCcw size={16} className="mr-2" />
                        Reintentar
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => window.location.href = '/'}
                        className="w-full text-gray-400 font-bold rounded-xl h-12 hover:text-gray-600"
                    >
                        Volver al Inicio
                    </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-6 border-t border-gray-100 text-left">
                        <p className="text-[10px] font-black uppercase text-rose-500 mb-2">Dev Error Details:</p>
                        <pre className="text-[10px] font-mono bg-rose-50 p-2 rounded text-rose-700 overflow-auto max-h-20">
                            {error.message}
                        </pre>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
