"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wrench, Ship, MapPin, Plus, Home, Settings2 } from "lucide-react";
import { RegisterPropertyModal } from "./RegisterPropertyModal";
import { RequestServiceModal } from "./dashboard/RequestServiceModal";
import { ManagePropertyModal } from "./dashboard/ManagePropertyModal";
import { Button } from "./ui/button";

import { CalendarGrid } from "./admin/CalendarGrid";
import { createServiceRequest } from "@/app/actions/dashboard";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface DashboardViewProps {
    userName: string;
    properties: Property[];
    alerts?: AlertItem[];
    serviceHistory?: React.ReactNode;
    bookings?: any[];
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop";

export function DashboardView({ userName, properties, alerts = [], serviceHistory = null, bookings = [] }: DashboardViewProps) {
    // Modal States
    const [isPropModalOpen, setPropModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'portfolio' | 'calendar'>('portfolio');
    const { toast } = useToast();

    const handleScheduleCleaning = async (booking: any) => {
        // 1. Construct FormData for the existing action
        const formData = new FormData();
        formData.append('propertyId', booking.property_id); // Ensure booking has property_id
        formData.append('serviceType', 'cleaning');

        // Cleanup date: End Date at 11:00 AM
        const cleanupDate = new Date(booking.end_date);
        cleanupDate.setHours(11, 0, 0, 0);
        formData.append('date', cleanupDate.toISOString());

        formData.append('notes', `Limpieza de salida (Auto-generada) para huésped: ${booking.guest_name || 'Desconocido'}`);

        // 2. Call Server Action
        const res = await createServiceRequest(formData);

        if (res.success) {
            toast({ title: "Limpieza Solicitada", description: "El equipo ha sido notificado." });
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* 0. Alerts Section */}
                <AlertWidget initialAlerts={alerts} />

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            {properties.length > 0 ? "Tu Portafolio" : `¡Bienvenido, ${userName}! 👋`}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {properties.length > 0
                                ? `Gestionando ${properties.length} ${properties.length === 1 ? 'propiedad' : 'propiedades'}.`
                                : "Empecemos configurando tu primera propiedad operada por nosotros."}
                        </p>
                    </div>
                    {properties.length > 0 && (
                        <div className="flex gap-2">
                            <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                                <button
                                    onClick={() => setActiveTab('portfolio')}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'portfolio' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Portafolio
                                </button>
                                <button
                                    onClick={() => setActiveTab('calendar')}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Calendario
                                </button>
                            </div>
                            <Button
                                className="bg-[#FF5A5F] hover:bg-[#E03E43] text-white rounded-xl shadow-md h-auto"
                                onClick={() => setPropModalOpen(true)}
                            >
                                <Plus size={18} className="mr-2" /> Nueva Propiedad
                            </Button>
                        </div>
                    )}
                </div>

                {activeTab === 'portfolio' ? (
                    <>
                        {/* 2. Content: Grid System or Empty State */}
                        {properties.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl p-16 border border-rose-100 shadow-xl text-center flex flex-col items-center justify-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
                                    <Home size={32} className="text-[#FF5A5F]" />
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <h2 className="text-2xl font-bold text-gray-900">Aún no tienes propiedades registrados</h2>
                                    <p className="text-gray-500">Regístralas para acceder a servicios de limpieza premium, mantenimiento y concierge VIP.</p>
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-[#FF5A5F] hover:bg-[#E03E43] text-white rounded-xl h-14 px-10 text-lg shadow-lg shadow-rose-200"
                                    onClick={() => setPropModalOpen(true)}
                                >
                                    Registrar Mi Primera Propiedad
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((prop, index) => (
                                    <motion.div
                                        key={prop.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                                    >
                                        {/* Luxury Header / Image */}
                                        <div className="h-48 bg-gray-200 relative overflow-hidden">
                                            <img
                                                src={prop.image_url || DEFAULT_IMAGE}
                                                alt={prop.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm border border-gray-100/50">
                                                <span className={`w-2 h-2 rounded-full ${prop.status === 'occupied' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'}`}></span>
                                                <span className={prop.status === 'occupied' ? 'text-emerald-700' : 'text-orange-700'}>
                                                    {prop.status === 'occupied' ? 'Ocupado' : 'Disponible'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1 min-h-[220px]">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{prop.title}</h3>
                                            <div className="flex items-center gap-1 text-gray-400 mb-4 text-sm font-medium">
                                                <MapPin size={14} className="shrink-0" />
                                                <span className="line-clamp-1">{prop.address}</span>
                                            </div>

                                            {/* Info Pills */}
                                            <div className="flex gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-6">
                                                {prop.bedrooms && <span>{prop.bedrooms} Hab</span>}
                                                {prop.ical_url && <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Sincronizado</span>}
                                            </div>

                                            {/* Action Buttons Grid */}
                                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                                <RequestServiceModal
                                                    propertyId={prop.id}
                                                    propertyName={prop.title}
                                                    serviceType="cleaning"
                                                    triggerButton={
                                                        <button className="w-full h-10 flex items-center justify-center text-xs font-bold border bg-white rounded-lg border-gray-100 hover:bg-rose-50 hover:text-[#FF5A5F] hover:border-rose-100 transition-all active:scale-95">
                                                            <Sparkles size={14} className="mr-2" /> Limpieza
                                                        </button>
                                                    }
                                                />
                                                <RequestServiceModal
                                                    propertyId={prop.id}
                                                    propertyName={prop.title}
                                                    serviceType="maintenance"
                                                    triggerButton={
                                                        <button className="w-full h-10 flex items-center justify-center text-xs font-bold border bg-white rounded-lg border-gray-100 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-100 transition-all active:scale-95">
                                                            <Wrench size={14} className="mr-2" /> Mtto
                                                        </button>
                                                    }
                                                />
                                            </div>

                                            <ManagePropertyModal
                                                propertyId={prop.id}
                                                propertyTitle={prop.title}
                                                currentStatus={prop.status || 'vacant'}
                                                triggerButton={
                                                    <button className="mt-2 w-full flex items-center justify-center font-bold px-4 py-2 bg-gray-900 hover:bg-black text-white text-[11px] uppercase tracking-widest h-10 rounded-lg transition-all active:scale-95 group/btn">
                                                        <Settings2 size={14} className="mr-2 group-hover/btn:rotate-45 transition-transform" /> Gestionar Unidad
                                                    </button>
                                                }
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-4">
                        <CalendarGrid bookings={bookings} onScheduleCleaning={handleScheduleCleaning} />
                    </div>
                )}

                {/* 3. Service History Section */}
                {properties.length > 0 && serviceHistory && activeTab === 'portfolio' && (
                    <div className="pt-8">
                        {serviceHistory}
                    </div>
                )}

                {/* MODALS */}
                <RegisterPropertyModal
                    isOpen={isPropModalOpen}
                    onClose={() => setPropModalOpen(false)}
                />

            </div>
        </div>
    );
}
