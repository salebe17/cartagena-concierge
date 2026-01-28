'use client';

// Force rebuild v2
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, User, ChevronRight, Settings, BookOpen, HelpCircle, Users, Plus, LogOut, ArrowRightLeft, Ship, CreditCard, Home, Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { BillingSection } from '../dashboard/BillingSection';
import { UserFinanceSection } from '../dashboard/UserFinanceSection';
import { HostFinanceView } from './HostFinanceView';
import { MarketplaceView } from './marketplace/MarketplaceView';
import { HelpView } from './help/HelpView';
import { HostSettingsView } from './settings/HostSettingsView';

interface HostMenuProps {
    userName: string;
    userFullName: string;
    userImage?: string;
    userPhone?: string;
    userBio?: string;
    revenue?: string;
    rating?: number;
    reviewsCount?: number;
    onLogout: () => void;
    properties?: any[]; // Allow properties to be passed
    onNavigate?: (tab: 'hoy' | 'calendario' | 'finanzas' | 'anuncios' | 'mensajes' | 'servicios' | 'menu') => void;
}

export function HostMenu({ userName, userFullName, userImage, userPhone, userBio, revenue = "$0", rating = 5.0, reviewsCount = 0, onLogout, properties = [], onNavigate }: HostMenuProps) {
    const [isSwitching, setIsSwitching] = useState(false);
    const [view, setView] = useState<'main' | 'finance' | 'billing' | 'properties' | 'wallet' | 'resources' | 'help' | 'settings'>('main');
    const router = useRouter();

    const handleSwitchToTraveler = () => {
        setIsSwitching(true);
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    };

    const handleWalletAccess = () => {
        const isProtected = localStorage.getItem('biometric_enabled') === 'true';
        if (isProtected) {
            // Simulate Biometric Challenge
            const confirmed = window.confirm("🔒 Seguridad: Confirma tu identidad para ver tu dinero.");
            if (confirmed) {
                setView('wallet');
            }
        } else {
            setView('wallet');
        }
    };

    if (view === 'resources') {
        return <MarketplaceView onBack={() => setView('main')} />;
    }

    if (view === 'help') {
        return (
            <HelpView
                onBack={() => setView('main')}
                onGoToChat={() => {
                    if (onNavigate) {
                        onNavigate('mensajes');
                    } else {
                        alert("Por favor selecciona la pestaña 'Soporte' en el menú inferior.");
                    }
                }}
            />
        );
    }

    if (view === 'properties') {
        // ... (properties view omitted for brevity)
        return (
            <div className="pb-24 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('main')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <ChevronRight size={20} className="rotate-180 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-black text-[#222222]">Mis Propiedades</h1>
                </div>
                {/* ... */}
            </div>
        );
    }

    if (view === 'settings') {
        return (
            <HostSettingsView
                onBack={() => setView('main')}
                userName={userFullName}
                userImage={userImage}
                userPhone={userPhone}
                userBio={userBio}
            />
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
                {/* Revenue/Gastos Card - Clickable to go to Finance */}
                <div
                    onClick={handleWalletAccess}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-40 cursor-pointer hover:border-black active:scale-95 transition-all group"
                >
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-[#222222]">Gastos</h3>
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Total invertido:</p>
                        <p className="text-lg font-black text-[#222222] tracking-tight group-hover:text-rose-600 transition-colors">{revenue} COP</p>
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
                <div
                    onClick={() => setView('help')} // Or a specific status view if we had one. 'help' is a good fallback for account status queries.
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-40 cursor-pointer hover:border-emerald-500 active:scale-95 transition-all group"
                >
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-[#222222]">Nivel</h3>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Estado de cuenta</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-emerald-500 group-hover:scale-110 transition-transform">Activo</span>
                        <div className="flex text-[#222222]">★</div>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <MenuItem icon={CreditCard} label="Finanzas" onClick={handleWalletAccess} />
                <MenuItem icon={Settings} label="Configuración de la cuenta" onClick={() => setView('settings')} />
                <MenuItem icon={BookOpen} label="Aliados VIP & Recursos" onClick={() => setView('resources')} />
                <MenuItem icon={HelpCircle} label="Obtén ayuda" onClick={() => setView('help')} />
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
