"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wrench, Ship, Users, Clock, ArrowRight, MapPin, Star, Plus, Home } from "lucide-react";
import Image from "next/image";
import { SimpleModal } from "./SimpleModal";
import { Button } from "./ui/button"; // Assuming shadcn button exists
import { Input } from "./ui/input";   // Assuming shadcn input exists
import { Label } from "./ui/label";   // Assuming shadcn label exists
import { registerProperty, submitServiceRequest } from "@/app/actions/dashboard";
import { useToast } from "@/hooks/use-toast";

interface DashboardViewProps {
    userName: string;
    properties: any[];
}

export function DashboardView({ userName, properties }: DashboardViewProps) {
    const { toast } = useToast();

    // Modal States
    const [isPropModalOpen, setPropModalOpen] = useState(false);
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Default fallback if properties exist
    const activeProperty = properties?.[0]; // If empty, handle in render

    const handleRegisterProperty = async (formData: FormData) => {
        setLoading(true);
        const res = await registerProperty(formData);
        setLoading(false);

        if (res.error) {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        } else {
            toast({ title: "¡Éxito!", description: "Propiedad registrada correctamente." });
            setPropModalOpen(false);
            // Router refresh is handled server side via revalidatePath, but client might need manual trigger if soft Nav
            // Next.js usually handles this if action returns
        }
    };

    const handleServiceRequest = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!activeProperty) return;

        setLoading(true);
        const form = new FormData(e.currentTarget);
        const date = form.get('date') as string;
        const notes = form.get('notes') as string;

        const res = await submitServiceRequest(activeProperty.id, selectedService, date, notes);
        setLoading(false);

        if (res.error) {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        } else {
            toast({ title: "Solicitud Recibida", description: "Estaremos coordinando tu servicio." });
            setServiceModalOpen(false);
        }
    };

    const openServiceModal = (service: string) => {
        if (!activeProperty) {
            toast({ title: "Primero registra una propiedad", variant: "destructive" });
            return;
        }
        setSelectedService(service);
        setServiceModalOpen(true);
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* 1. Welcome Section */}
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hola, {userName} 👋</h1>
                        <p className="text-gray-500 font-medium">
                            {properties.length > 0
                                ? "Tu operación en Cartagena está activa."
                                : "Comencemos a configurar tu operación."}
                        </p>
                    </div>
                    {properties.length > 0 && (
                        <div className="hidden sm:block">
                            <Button
                                className="bg-[#FF5A5F] hover:bg-[#E03E43] text-white rounded-xl"
                                onClick={() => setPropModalOpen(true)}
                            >
                                <Plus size={18} className="mr-2" /> Nueva Propiedad
                            </Button>
                        </div>
                    )}
                </div>

                {/* 2. Content: Empty State OR Dashboard */}
                {properties.length === 0 ? (
                    // EMPTY STATE
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-12 border border-blue-100 shadow-sm text-center flex flex-col items-center justify-center space-y-6"
                    >
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                            <Home size={40} className="text-[#FF5A5F]" />
                        </div>
                        <div className="space-y-2 max-w-md">
                            <h2 className="text-2xl font-bold text-gray-900">Aún no tienes propiedades</h2>
                            <p className="text-gray-500">Registra tu primera propiedad para acceder a servicios de limpieza, mantenimiento y concierge VIP.</p>
                        </div>
                        <Button
                            size="lg"
                            className="bg-[#FF5A5F] hover:bg-[#E03E43] text-white rounded-xl h-12 px-8 text-lg shadow-lg shadow-rose-200"
                            onClick={() => setPropModalOpen(true)}
                        >
                            Registrar mi primera propiedad
                        </Button>
                    </motion.div>
                ) : (
                    // DASHBOARD CONTENT
                    <>
                        {/* 2. Active Property Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            {/* Photo */}
                            <div className="w-full md:w-64 h-48 relative rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                {activeProperty.image_url ? (
                                    <Image
                                        src={activeProperty.image_url}
                                        alt="Active Property"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                        <Home size={32} />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-600 shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Activo
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 py-2 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{activeProperty.title}</h2>
                                            <div className="flex items-center gap-1 text-gray-400 mt-1 mb-4">
                                                <MapPin size={14} />
                                                <span className="text-sm">{activeProperty.address || "Cartagena de Indias"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                                            <Users size={14} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Estado Operativo</p>
                                            <p className="text-xs text-green-600 font-medium">Disponible para servicios</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            {activeProperty.ical_url ? (
                                                <span className="text-blue-500 flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded-md font-bold">iCal Conectado</span>
                                            ) : (
                                                <span className="text-orange-400 flex items-center gap-1 text-xs">Sin Sincronizar</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Quick Actions Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Gestión Rápida</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'checklist', title: "Limpieza Express", icon: Sparkles, color: "text-rose-500", bg: "bg-rose-50" },
                                    { id: 'maintenance', title: "Mantenimiento", icon: Wrench, color: "text-blue-500", bg: "bg-blue-50" },
                                    { id: 'concierge', title: "Concierge VIP", icon: Ship, color: "text-cyan-500", bg: "bg-cyan-50" },
                                    { id: 'guest', title: "Acceso Huésped", icon: Users, color: "text-amber-500", bg: "bg-amber-50" }
                                ].map((item) => (
                                    <motion.button
                                        key={item.id}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => openServiceModal(item.title)}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:border-[#FF5A5F] hover:shadow-md transition-all group"
                                    >
                                        <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon size={26} strokeWidth={2} />
                                        </div>
                                        <span className="font-bold text-gray-700 group-hover:text-[#FF5A5F] transition-colors">{item.title}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* MODALS */}

                {/* 1. Register Property Modal */}
                <SimpleModal
                    isOpen={isPropModalOpen}
                    onClose={() => setPropModalOpen(false)}
                    title="Nueva Propiedad"
                >
                    <form action={handleRegisterProperty} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Nombre del Edificio / Propiedad</Label>
                            <Input name="title" placeholder="Ej. Edificio H2 Plaza" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección / Apto</Label>
                            <Input name="address" placeholder="Ej. Apto 1201" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ical_url">Link de Calendario (Airbnb iCal)</Label>
                            <Input name="ical_url" placeholder="https://airbnb.com/calendar/..." />
                            <p className="text-xs text-gray-400">Opcional. Sirve para sincronizar reservas automáticamente.</p>
                        </div>
                        <Button type="submit" className="w-full bg-[#FF5A5F] hover:bg-[#E03E43] mt-4" disabled={loading}>
                            {loading ? <span className="animate-spin mr-2">⏳</span> : "Registrar Propiedad"}
                        </Button>
                    </form>
                </SimpleModal>

                {/* 2. Service Request Modal */}
                <SimpleModal
                    isOpen={isServiceModalOpen}
                    onClose={() => setServiceModalOpen(false)}
                    title={`Solicitar ${selectedService}`}
                >
                    <form onSubmit={handleServiceRequest} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha y Hora Preferida</Label>
                            <Input type="datetime-local" name="date" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas o Instrucciones</Label>
                            <Input name="notes" placeholder="Ej. Lavar sábanas extra, revisar aire acondicionado..." required />
                        </div>
                        <Button type="submit" className="w-full bg-[#FF5A5F] hover:bg-[#E03E43] mt-4" disabled={loading}>
                            {loading ? <span className="animate-spin mr-2">⏳</span> : "Confirmar Solicitud"}
                        </Button>
                    </form>
                </SimpleModal>

            </div>
        </div>
    );
}
