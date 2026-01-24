"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wrench, Ship, Users, MapPin, Plus, Home, Settings2 } from "lucide-react";
import Image from "next/image";
import { SimpleModal } from "./SimpleModal";
import { RegisterPropertyModal } from "./RegisterPropertyModal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { submitServiceRequest } from "@/app/actions/dashboard";
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
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleServiceRequest = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedProperty) return;

        setLoading(true);
        const form = new FormData(e.currentTarget);
        const date = form.get('date') as string;
        const notes = form.get('notes') as string;

        const res = await submitServiceRequest(selectedProperty.id, selectedService, date, notes);
        setLoading(false);

        if (res.error) {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        } else {
            toast({ title: "Solicitud Recibida", description: `Tu servicio para ${selectedProperty.title} ha sido agendado.` });
            setServiceModalOpen(false);
        }
    };

    const openServiceModal = (property: any, service: string) => {
        setSelectedProperty(property);
        setSelectedService(service);
        setServiceModalOpen(true);
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            {properties.length > 0 ? "Tu Portafolio" : `¡Bienvenido, ${userName}! 👋`}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {properties.length > 0
                                ? `Gestionando ${properties.length} ${properties.length === 1 ? 'propiedad' : 'propiedades'} en Cartagena.`
                                : "Empecemos configurando tu primera propiedad operada por nosotros."}
                        </p>
                    </div>
                    {properties.length > 0 && (
                        <Button
                            className="bg-[#FF5A5F] hover:bg-[#E03E43] text-white rounded-xl shadow-md"
                            onClick={() => setPropModalOpen(true)}
                        >
                            <Plus size={18} className="mr-2" /> Nueva Propiedad
                        </Button>
                    )}
                </div>

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
                            <h2 className="text-2xl font-bold text-gray-900">Aún no tienes propiedades</h2>
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
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col"
                            >
                                {/* Property Header / Image */}
                                <div className="aspect-[4/3] relative bg-gray-100">
                                    {prop.image_url ? (
                                        <Image src={prop.image_url} alt={prop.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Home size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-600 shadow-sm flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Operando
                                    </div>
                                </div>

                                {/* Property Details */}
                                <div className="p-5 space-y-4 flex-1 flex flex-col">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 truncate">{prop.title}</h3>
                                        <div className="flex items-center gap-1 text-gray-400 mt-1">
                                            <MapPin size={14} />
                                            <span className="text-xs truncate">{prop.address}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-t border-gray-50 pt-4">
                                        <div className="flex gap-4">
                                            <span>{prop.bedrooms || 1} Hab.</span>
                                            <span>{prop.bathrooms || 1} Baños</span>
                                        </div>
                                        {prop.ical_url && (
                                            <span className="text-blue-500 bg-blue-50 px-2 py-1 rounded">iCal Activo</span>
                                        )}
                                    </div>

                                    {/* Action Buttons Grid */}
                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg h-9 border-gray-100 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                            onClick={() => openServiceModal(prop, "Limpieza")}
                                        >
                                            <Sparkles size={14} className="mr-2" /> Limpieza
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg h-9 border-gray-100 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                                            onClick={() => openServiceModal(prop, "Mantenimiento")}
                                        >
                                            <Wrench size={14} className="mr-2" /> Mtto
                                        </Button>
                                    </div>

                                    <Button className="w-full bg-gray-900 hover:bg-black text-white text-xs h-9 rounded-lg">
                                        <Settings2 size={14} className="mr-2" /> Gestionar Unidad
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* MODALS */}

                {/* 1. Modular Property Registration */}
                <RegisterPropertyModal
                    isOpen={isPropModalOpen}
                    onClose={() => setPropModalOpen(false)}
                />

                {/* 2. Service Request Modal (Context Aware) */}
                <SimpleModal
                    isOpen={isServiceModalOpen}
                    onClose={() => setServiceModalOpen(false)}
                    title={`Solicitar ${selectedService}`}
                >
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Para la propiedad:</p>
                        <p className="text-sm font-bold text-gray-900">{selectedProperty?.title}</p>
                    </div>

                    <form onSubmit={handleServiceRequest} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha y Hora Preferida</Label>
                            <Input type="datetime-local" name="date" required disabled={loading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Instrucciones Especiales</Label>
                            <Input name="notes" placeholder="Ej. Cambio de sábanas en hab 2..." required disabled={loading} />
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
