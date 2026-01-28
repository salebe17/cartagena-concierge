"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Wrench, Ship, MapPin, Plus, Home, Settings2, MessageSquare, Menu, LayoutGrid } from "lucide-react";
import { RegisterPropertyModal } from "./RegisterPropertyModal";
import { RequestServiceModal } from "./dashboard/RequestServiceModal";
import { ManagePropertyModal } from "./dashboard/ManagePropertyModal";
import { Button } from "./ui/button";

import { CalendarGrid } from "./admin/CalendarGrid";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AlertWidget, AlertItem } from "./dashboard/AlertWidget";
import { BillingSection } from "./dashboard/BillingSection";
import { Property } from "@/lib/types";
import { BottomNav } from "./host/BottomNav";
import { HostServicesView } from "./host/HostServicesView";
import { HostTodayView } from "./host/HostTodayView";
import { HostMessagesView } from "./host/HostMessagesView";
import { HostMenu } from "./host/HostMenu";
import { HostFinanceView } from "./host/HostFinanceView";
import { signOut } from "@/app/actions/dashboard";

interface DashboardViewProps {
    userName: string;
    userFullName: string;
    userImage?: string;
    userPhone?: string;
    userBio?: string;
    currentUserId: string;
    properties: Property[];
    alerts?: AlertItem[];
    serviceHistory?: React.ReactNode;
    bookings?: any[];
    services?: any[];
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop";

export function DashboardView({ userName, userFullName, userImage, userPhone, userBio, currentUserId, properties, alerts = [], serviceHistory = null, bookings = [], services = [] }: DashboardViewProps) {
    // Client-side fallback for avatar
    const [finalAvatar, setFinalAvatar] = useState(userImage);

    // Sync with local storage if server image is missing
    useEffect(() => {
        const cached = localStorage.getItem('cached_avatar_url');
        if (!userImage && cached) {
            setFinalAvatar(cached);
        } else if (userImage) {
            setFinalAvatar(userImage);
            // Update cache with fresh server data if available
            localStorage.setItem('cached_avatar_url', userImage);
        }
    }, [userImage]);
    const [isPropModalOpen, setPropModalOpen] = useState(false);
    // Tab State: Unifying to Spanish IDs for consistency with BottomNav
    const [activeTab, setActiveTab] = useState<'hoy' | 'calendario' | 'finanzas' | 'anuncios' | 'mensajes' | 'servicios' | 'menu'>('hoy');
    const { toast } = useToast();

    // Map legacy props or usage if needed, but we will stick to new tabs.
    // 'hoy' = Portfolio/Home
    // 'calendario' = Calendar
    // 'anuncios' = Properties List (New)
    // 'mensajes' = Chat
    // 'menu' = Account

    const handleScheduleCleaning = async (booking: any) => {
        // ... (Date construction logic remains same)
        const [year, month, day] = booking.end_date.split('-').map(Number);
        const cleanupDate = new Date(year, month - 1, day, 11, 0, 0);

        // ... (Client side check remains same for fast feedback)
        const dateStr = cleanupDate.toISOString().split('T')[0];
        const alreadyExists = services.some(s => {
            if (s.property_id !== booking.properties.id) return false;
            const sDate = new Date(s.requested_date);
            return s.service_type === 'cleaning' &&
                sDate.getFullYear() === year &&
                sDate.getMonth() === (month - 1) &&
                sDate.getDate() === day;
        });

        if (alreadyExists) {
            toast({ title: "Atención", description: "Ya existe una limpieza programada para este checkout.", variant: "default" });
            return;
        }

        const formData = new FormData();
        formData.append('propertyId', booking.property_id);
        formData.append('serviceType', 'cleaning');
        formData.append('date', cleanupDate.toISOString());
        formData.append('notes', `Limpieza de salida (Auto-generada) para huésped: ${booking.guest_name || 'Desconocido'}`);

        try {
            const res = await fetch('/api/host/requests/create', { method: 'POST', body: formData });
            const json = await res.json();

            if (json.success) {
                toast({ title: "Limpieza Solicitada", description: "Se ha agendado la limpieza de salida." });
                window.location.reload(); // Refresh to see new request
            } else {
                toast({ title: "Error", description: json.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error de conexión", description: "No se pudo conectar con el servidor.", variant: "destructive" });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'hoy':
                // For 'hoy', we render the new Today View. 
                // Note: The original generic "Portfolio" view is now implicitly gone from 'hoy'.
                // If the user wants to see the Portfolio Grid, they might expect it under "Anuncios" or a different logic.
                // Given the screenshot, 'Hoy' is a dashboard status view. 'Anuncios' is the list.
                // So this replacement is correct based on the new requirements.
                return (
                    <HostTodayView
                        bookings={bookings}
                        alerts={alerts}
                        services={services}
                        userName={userName}
                    />
                );
            case 'calendario':
                return (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-black text-[#222222]">Calendario</h1>
                            <button
                                onClick={async () => {
                                    const toastId = toast({ title: "Sincronizando...", description: "Buscando nuevas reservas en Airbnb...", duration: 10000 });
                                    try {
                                        const res = await fetch('/api/host/sync-calendar', { method: 'POST' });
                                        const json = await res.json();
                                        if (json.success) {
                                            toast({ title: "Sincronización Exitosa", description: json.message });
                                            window.location.reload();
                                        } else {
                                            toast({ title: "Error", description: json.error || "Falló la sincronización", variant: "destructive" });
                                        }
                                    } catch (e) {
                                        toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
                                    }
                                }}
                                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
                            >
                                <LayoutGrid size={16} className="text-rose-500" />
                                Sincronizar Ahora
                            </button>
                        </div>
                        <CalendarGrid bookings={bookings} services={services} onScheduleCleaning={handleScheduleCleaning} />
                    </div>
                );
            case 'anuncios':
                return (
                    <div className="animate-in fade-in duration-300 pb-20">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-black text-[#222222]">Tus anuncios</h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Create New Listing Card */}
                            <div
                                onClick={() => setPropModalOpen(true)}
                                className="group cursor-pointer flex flex-col items-center justify-center aspect-[4/3] rounded-3xl border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-50 transition-all text-center p-6 space-y-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus size={32} className="text-gray-400 group-hover:text-black" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Crear nuevo anuncio</h3>
                                    <p className="text-sm text-gray-500 max-w-[200px] mx-auto">Pon tu propiedad frente a miles de viajeros.</p>
                                </div>
                            </div>

                            {properties.map(prop => (
                                <ManagePropertyModal
                                    key={prop.id}
                                    propertyId={prop.id}
                                    propertyTitle={prop.title}
                                    currentStatus={prop.status || 'vacant'}
                                    triggerButton={
                                        <div className="group cursor-pointer h-full">
                                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-200 mb-4 border border-gray-100 shadow-sm transition-all group-hover:shadow-md">
                                                <Image
                                                    src={prop.image_url || DEFAULT_IMAGE}
                                                    alt={prop.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-full animate-pulse ${prop.status === 'occupied' ? 'bg-indigo-500' : 'bg-green-500'}`}></div>
                                                    <span className="text-xs font-bold text-gray-800">
                                                        {prop.status === 'occupied' ? 'Ocupado' : 'Disponible'}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-[#222222] leading-tight mb-1">{prop.title}</h3>
                                            <p className="text-sm text-gray-500">Alojamiento en Cartagena, Bolívar</p>
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    </div>
                );
            case 'mensajes':
                return (
                    <HostMessagesView
                        bookings={bookings}
                        currentUserId={currentUserId}
                        userName={userName}
                    />
                );
            case 'servicios':
                return (
                    <HostServicesView
                        properties={properties}
                        services={services}
                        bookings={bookings}
                    />
                );
            case 'finanzas':
                return <HostFinanceView />;
            case 'menu':
                return (
                    <HostMenu
                        userName={userName}
                        userFullName={userFullName}
                        userImage={finalAvatar}
                        userPhone={userPhone}
                        userBio={userBio}
                        onLogout={() => signOut()}
                        // Pass mock revenue for now or calculated if available
                        revenue="$1.2M"
                        properties={properties}
                        onNavigate={(tab) => setActiveTab(tab)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans pb-20 md:pb-0">
            {/* Desktop Navigation (Hidden on Mobile) */}
            <div className="hidden md:block bg-white border-b border-gray-100 py-4 px-8 mb-8 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-black tracking-tighter">Cartagena<span className="text-rose-500">Concierge</span></h1>
                    <div className="flex gap-4">
                        <div className="flex gap-4">
                            {['hoy', 'calendario', 'anuncios', 'mensajes', 'servicios'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {tab === 'mensajes' ? 'Soporte' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                            <button onClick={() => setActiveTab('menu')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                <Menu size={20} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <main className="max-w-6xl mx-auto p-4 md:p-8">
                {/* Only show "Welcome" header on 'hoy' tab */}
                {activeTab === 'hoy' && (
                    <div className="mb-8 block">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            {properties.length > 0 ? "Tu Portafolio" : `¡Bienvenido, ${userName}! 👋`}
                        </h1>
                    </div>
                )}

                {renderContent()}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav activeTab={activeTab} onChange={setActiveTab} />

            {/* Modals */}
            <RegisterPropertyModal isOpen={isPropModalOpen} onClose={() => setPropModalOpen(false)} />
        </div >
    );
}
