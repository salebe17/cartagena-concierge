'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, User, ChevronRight, Settings, BookOpen, HelpCircle, Users, Plus, LogOut, ArrowRightLeft, Ship, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { BillingSection } from '../dashboard/BillingSection';
import { UserFinanceSection } from '../dashboard/UserFinanceSection';

interface HostMenuProps {
    userName: string;
    userImage?: string;
    revenue?: string;
    rating?: number;
    reviewsCount?: number;
    onLogout: () => void;
}

export function HostMenu({ userName, userImage, revenue = "$0", rating = 5.0, reviewsCount = 0, onLogout }: HostMenuProps) {
    const [isSwitching, setIsSwitching] = useState(false);
    const [view, setView] = useState<'main' | 'finance' | 'billing'>('main');
    const router = useRouter();

    const handleSwitchToTraveler = () => {
        setIsSwitching(true);
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    };

    if (view === 'billing') {
        return (
            <div className="pb-24 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <ChevronRight size={20} className="rotate-180 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-black text-[#222222]">Métodos de Pago</h1>
                </div>
                <BillingSection />
            </div>
        );
    }

    if (view === 'finance') {
        return (
            <div className="pb-24 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <ChevronRight size={20} className="rotate-180 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-black text-[#222222]">Mis Finanzas</h1>
                </div>
                <UserFinanceSection />
            </div>
        );
    }

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Transition Overlay */}
            {isSwitching && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-700">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-white text-center space-y-4"
                    >
                        <Ship size={64} className="mx-auto text-rose-500 animate-bounce" />
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter">Cambiando a modo viajero...</h2>
                            <p className="text-gray-400 text-sm">Explora Cartagena como un huésped.</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-[#222222]">Menú</h1>
                <div className="flex gap-4">
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Bell size={20} className="text-[#222222]" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                        {userImage ? (
                            <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                <User size={20} className="text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Revenue Card - Clickable to go to Finance */}
                <div
                    onClick={() => setView('finance')}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-40 cursor-pointer hover:border-black transition-colors"
                >
                    <div>
                        <h3 className="text-sm font-bold text-[#222222]">Gastos</h3>
                        <p className="text-xs text-gray-500 mt-1">Total invertido:</p>
                        <p className="text-lg font-black text-[#222222] tracking-tight">{revenue} COP</p>
                    </div>
                    {/* Fake Chart */}
                    <div className="flex items-end gap-1.5 h-12 mt-2 opacity-90">
                        <div className="w-1/6 bg-rose-500 h-[30%] rounded-t-sm"></div>
                        <div className="w-1/6 bg-rose-500 h-[60%] rounded-t-sm"></div>
                        <div className="w-1/6 bg-rose-500 h-[40%] rounded-t-sm"></div>
                        <div className="w-1/6 bg-rose-500 h-[50%] rounded-t-sm"></div>
                        <div className="w-1/6 bg-gray-200 h-[20%] rounded-t-sm"></div>
                        <div className="w-1/6 bg-gray-100 h-[10%] rounded-t-sm"></div>
                    </div>
                </div>

                {/* Info / Ratings Card */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-40">
                    <div>
                        <h3 className="text-sm font-bold text-[#222222]">Nivel</h3>
                        <p className="text-xs text-gray-500 mt-1">Estado de cuenta</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-emerald-500">Activo</span>
                        <div className="flex text-[#222222]">★</div>
                    </div>
                </div>
            </div>

            {/* Menu List */}
            <div className="space-y-1">
                <MenuItem icon={CreditCard} label="Métodos de Pago" onClick={() => setView('billing')} />
                <MenuItem icon={Settings} label="Configuración de la cuenta" />
                <MenuItem icon={BookOpen} label="Recursos para anfitrionar" />
                <MenuItem icon={HelpCircle} label="Obtén ayuda" />
                <MenuItem icon={LogOut} label="Cerrar Sesión" onClick={onLogout} isLast />
            </div>

            {/* Toggle Mode Button */}
            <div className="sticky bottom-24 flex justify-center mt-8 md:hidden">
                <button onClick={handleSwitchToTraveler} className="bg-[#222222] text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-transform hover:bg-[#000000]">
                    <ArrowRightLeft size={16} />
                    Cambiar a modo viajero
                </button>
            </div>
        </div>
    );
}

const MenuItem = ({ icon: Icon, label, onClick, isLast }: { icon: any, label: string, onClick?: () => void, isLast?: boolean }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between py-4 hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}>
        <div className="flex items-center gap-4">
            <Icon size={24} className="text-[#222222] stroke-1" />
            <span className="text-[#222222] font-light text-base">{label}</span>
        </div>
        <ChevronRight size={20} className="text-gray-400" />
    </button>
);
