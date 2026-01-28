'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Smartphone, Delete, Fingerprint, Loader2, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface WalletGuardProps {
    onUnlock: () => void;
    onClose: () => void;
}

export function WalletGuard({ onUnlock, onClose }: WalletGuardProps) {
    const [pin, setPin] = useState(['', '', '', '']);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState(false);

    // In a real app, this PIN would be hashed in user metadata/localStorage securely
    // For this MVP, we default to '0000' or read from local if we implemented setup
    const CORRECT_PIN = "0000";

    useEffect(() => {
        // Auto-trigger biometric simulation on mount for premium feel
        // handleBiometricScan();
    }, []);

    const handleNumberClick = (num: number) => {
        const nextIndex = pin.findIndex(d => d === '');
        if (nextIndex === -1) return;

        const newPin = [...pin];
        newPin[nextIndex] = num.toString();
        setPin(newPin);
        setError(false);

        // Check if complete
        if (nextIndex === 3) {
            checkPin(newPin.join(''));
        }
    };

    const handleDelete = () => {
        const lastIndex = [...pin].reverse().findIndex(d => d !== '');
        if (lastIndex === -1) return;

        const realIndex = 3 - lastIndex;
        const newPin = [...pin];
        newPin[realIndex] = '';
        setPin(newPin);
        setError(false);
    };

    const checkPin = (inputPin: string) => {
        setIsChecking(true);
        setTimeout(() => {
            if (inputPin === CORRECT_PIN) {
                // Success
                toast({ title: "Billetera Desbloqueada", className: "bg-emerald-50 text-emerald-600 border-none" });
                onUnlock();
            } else {
                setError(true);
                setPin(['', '', '', '']);
                toast({ title: "PIN Incorrecto", description: "Intenta de nuevo (0000)", variant: "destructive" });
            }
            setIsChecking(false);
        }, 500);
    };

    const handleBiometricScan = async () => {
        setIsChecking(true);

        try {
            const { verifyBiometrics } = await import('@/lib/biometrics');
            await verifyBiometrics();

            // If function returns (didn't throw), it means user successfully verified presence!
            toast({ title: "Identidad Confirmada", className: "bg-emerald-50 text-emerald-600 border-none" });
            onUnlock();

        } catch (e) {
            console.error(e);
            toast({ title: "Error Biométrico", description: "Usa el PIN o intenta nuevamente.", variant: "destructive" });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#F4F4F5] flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-6 left-6" onClick={onClose}>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer">
                    <Shield size={20} className="text-gray-400" />
                </div>
            </div>

            <div className="w-full max-w-xs mx-auto text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-gray-200/50">
                        <Lock size={32} className="text-rose-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-[#222222] mb-2">Billetera Bloqueada</h2>
                <p className="text-gray-500 text-sm mb-10">Ingresa tu PIN de seguridad para ver tus finanzas.</p>

                {/* PIN Circles */}
                <div className="flex justify-center gap-4 mb-12">
                    {pin.map((digit, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full transition-all duration-300 ${digit !== ''
                                ? 'bg-rose-500 scale-110'
                                : error
                                    ? 'bg-rose-200 animate-shake'
                                    : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-x-8 gap-y-6 max-w-[280px] mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="w-16 h-16 rounded-full text-2xl font-bold text-[#222222] bg-transparent hover:bg-gray-100 transition-colors focus:outline-none"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="flex items-center justify-center">
                        {/* Biometric Trigger */}
                        <button onClick={handleBiometricScan} className="w-16 h-16 flex items-center justify-center text-rose-500 rounded-full hover:bg-rose-50 transition-colors">
                            {isChecking ? <Loader2 className="animate-spin" /> : <ScanFace size={32} />}
                        </button>
                    </div>
                    <button
                        onClick={() => handleNumberClick(0)}
                        className="w-16 h-16 rounded-full text-2xl font-bold text-[#222222] bg-transparent hover:bg-gray-100 transition-colors focus:outline-none"
                    >
                        0
                    </button>
                    <div className="flex items-center justify-center">
                        <button onClick={handleDelete} className="w-16 h-16 flex items-center justify-center text-gray-400 hover:text-[#222222] transition-colors">
                            <Delete size={24} />
                        </button>
                    </div>
                </div>

                <p className="mt-12 text-xs text-gray-400">PIN por defecto: 0000</p>
            </div>
        </div>
    );
}
