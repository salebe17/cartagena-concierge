"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wrench, Ship, MapPin, Plus, Home, Settings2, MessageSquare, Menu, LayoutGrid } from "lucide-react";
import { RegisterPropertyModal } from "./RegisterPropertyModal";
import { RequestServiceModal } from "./dashboard/RequestServiceModal";
import { ManagePropertyModal } from "./dashboard/ManagePropertyModal";
import { Button } from "./ui/button";

import { CalendarGrid } from "./admin/CalendarGrid";
import { createServiceRequest } from "@/app/actions/dashboard";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AlertWidget, AlertItem } from "./dashboard/AlertWidget";
import { BillingSection } from "./dashboard/BillingSection";
import { Property } from "@/lib/types";
import { BottomNav } from "./host/BottomNav";
import { HostServicesView } from "./host/HostServicesView";
import { HostTodayView } from "./host/HostTodayView";
import { HostMessagesView } from "./host/HostMessagesView";
import { signOut } from "@/app/actions/dashboard";

interface DashboardViewProps {
    userName: string;
    currentUserId: string;
    properties: Property[];
    alerts?: AlertItem[];
    serviceHistory?: React.ReactNode;
    bookings?: any[];
    services?: any[];
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop";

export function DashboardView({ userName, currentUserId, properties, alerts = [], serviceHistory = null, bookings = [], services = [] }: DashboardViewProps) {
    // Modal States
    const [isPropModalOpen, setPropModalOpen] = useState(false);
    // Tab State: Unifying to Spanish IDs for consistency with BottomNav
    const [activeTab, setActiveTab] = useState<'hoy' | 'calendario' | 'anuncios' | 'mensajes' | 'servicios'>('hoy');
    const { toast } = useToast();

    // Map legacy props or usage if needed, but we will stick to new tabs.
    // 'hoy' = Portfolio/Home
    // 'calendario' = Calendar
    // 'anuncios' = Properties List (New)
    // 'mensajes' = Chat
    // 'menu' = Account

    const handleScheduleCleaning = async (booking: any) => {
        // 1. Safe Date Construction (Local Time) to prevent Timezone shift
        // booking.end_date is YYYY-MM-DD
        const [year, month, day] = booking.end_date.split('-').map(Number);
        // Create date at 11:00 AM Local Time
        const cleanupDate = new Date(year, month - 1, day, 11, 0, 0);

        // 2. Duplicate Check (Client Side)
        // Check if we already have a 'cleaning' service for this property on this date
        // Compare YYYY-MM-DD parts
        const dateStr = cleanupDate.toISOString().split('T')[0]; // This gives UTC date part, check if that matches user expectation?
        // Wait, cleanupDate is Local. toISOString converts to UTC.
        // If Local is UTC-5, 11:00 AM -> 16:00 UTC. Date part stays same.
        // But if user is UTC+10? 
        // Let's compare using the ISO string logic matching the server.
        // The server stores ISO. 
        // Let's strictly check if we see any service in `services` that matches the property and the DAY.

        const alreadyExists = services.some(s => {
            if (s.property_id !== booking.properties.id) return false;
            // s.requested_date is ISO. 
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

        // 3. Submit
        const formData = new FormData();
        formData.append('propertyId', booking.property_id); // Ensure booking has property_id
        formData.append('serviceType', 'cleaning');
        formData.append('date', cleanupDate.toISOString());
        formData.append('notes', `Limpieza de salida (Auto-generada) para huésped: ${booking.guest_name || 'Desconocido'}`);

        const res = await createServiceRequest(formData);

        if (res.success) {
            toast({ title: "Limpieza Solicitada", description: "Se ha agendado la limpieza de salida." });
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
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
                        userName={userName}
                    />
                );
            case 'calendario':
                return (
                    <div className="animate-in fade-in duration-300">
                        <CalendarGrid bookings={bookings} services={services} onScheduleCleaning={handleScheduleCleaning} />
                    </div>
                );
            case 'anuncios':
                return (
                    <div className="animate-in fade-in duration-300 pb-20">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-black text-[#222222]">Tus anuncios</h1>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Sparkles size={18} /></button>
                                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200" onClick={() => setPropModalOpen(true)}><Plus size={18} /></button>
                            </div>
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
                                <div key={prop.id} className="group cursor-pointer">
                                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-200 mb-4 border border-gray-100 shadow-sm transition-all group-hover:shadow-md">
                                        <img src={prop.image_url || DEFAULT_IMAGE} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                                            <span className="text-xs font-bold text-gray-800">Publicado</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#222222] leading-tight mb-1">{prop.title}</h3>
                                    <p className="text-sm text-gray-500">Alojamiento en Cartagena, Bolívar</p>
                                </div>
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
                return <HostServicesView properties={properties} />;
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
                        {['hoy', 'calendario', 'anuncios', 'mensajes'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {tab === 'mensajes' ? 'Soporte' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                        <button onClick={() => setActiveTab('servicios')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <LayoutGrid size={20} />
                        </button>
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
        </div>
    );
}
