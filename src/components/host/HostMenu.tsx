'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, User, ChevronRight, Settings, BookOpen, HelpCircle, Users, Plus, LogOut, ArrowRightLeft, Ship, CreditCard, Home, Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { BillingSection } from '../dashboard/BillingSection';
import { UserFinanceSection } from '../dashboard/UserFinanceSection';
import { HostFinanceView } from './HostFinanceView';

interface HostMenuProps {
    userName: string;
    userImage?: string;
    revenue?: string;
    rating?: number;
    reviewsCount?: number;
    onLogout: () => void;
    properties?: any[]; // Allow properties to be passed
}

export function HostMenu({ userName, userImage, revenue = "$0", rating = 5.0, reviewsCount = 0, onLogout, properties = [] }: HostMenuProps) {
    const [isSwitching, setIsSwitching] = useState(false);
    const [view, setView] = useState<'main' | 'finance' | 'billing' | 'properties' | 'wallet'>('main');
    const router = useRouter();

    const handleSwitchToTraveler = () => {
        setIsSwitching(true);
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    };


    if (view === 'properties') {
        return (
            <div className="pb-24 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <ChevronRight size={20} className="rotate-180 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-black text-[#222222]">Mis Propiedades</h1>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Minimal Property List */}
                    {properties.map((prop: any) => (
                        <div key={prop.id} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-gray-200 relative overflow-hidden shrink-0">
                                <img src={prop.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100"} alt={prop.title} className="object-cover w-full h-full" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="font-bold text-[#222222]">{prop.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${prop.status === 'occupied' ? 'bg-indigo-500' : 'bg-green-500'}`}></div>
                                    <span className="text-xs text-gray-500">{prop.status === 'occupied' ? 'Ocupado' : 'Disponible'}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 line-clamp-1">{prop.address || 'Cartagena, Colombia'}</p>
                            </div>
                        </div>
                    ))}
                    <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">Para editar tus propiedades, contáctanos.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'wallet') {
        return (
            <div className="pb-24 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <ChevronRight size={20} className="rotate-180 text-gray-600" />
                    </button>
                    {/* HostFinanceView has its own title, but we can wrap it or let it handle it. 
                        HostFinanceView has "Billetera" title. Let's just create a wrapper to handle the back button consistently. */}
                </div>
                {/* We need to override the padding/title in HostFinanceView or accept that it duplicates? 
                    Actually, HostFinanceView has a title. 
                    Let's render it directly. */}
                <div className="-mt-12">
                    <HostFinanceView />
                </div>
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
                    onClick={() => setView('wallet')}
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

            import {MarketplaceView} from './marketplace/MarketplaceView';

            // ... (in HostMenu function)
            const [view, setView] = useState<'main' | 'finance' | 'billing' | 'properties' | 'wallet' | 'resources'>('main');

            // ...

            if (view === 'resources') {
        return <MarketplaceView onBack={() => setView('main')} />;
    }

            if (view === 'wallet') {
                // ...
                <div className="space-y-1">
                    <MenuItem icon={CreditCard} label="Finanzas" onClick={() => setView('wallet')} />
                    <MenuItem icon={Settings} label="Configuración de la cuenta" />
                    <MenuItem icon={BookOpen} label="Aliados VIP & Recursos" onClick={() => setView('resources')} />
                    <MenuItem icon={HelpCircle} label="Obtén ayuda" />
                    <MenuItem icon={LogOut} label="Cerrar Sesión" onClick={onLogout} isLast />
                </div>

            {/* Toggle Mode Button */}
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
