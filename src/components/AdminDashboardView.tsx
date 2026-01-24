"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    CheckCircle2,
    Sparkles,
    Wrench,
    Ship,
    User,
    Home,
    ExternalLink,
    Loader2,
    Check,
    X
} from "lucide-react";
import { adminUpdateServiceStatus } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { RequestDetailsModal } from "./dashboard/RequestDetailsModal";


import { ServiceRequest } from "@/lib/types";

interface AdminDashboardViewProps {
    requests: ServiceRequest[];
    bookings?: any[];
}

export function AdminDashboardView({ requests: initialRequests, bookings = [] }: AdminDashboardViewProps) {
    const [requests, setRequests] = useState(initialRequests);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'requests' | 'calendar'>('requests');
    const [filterPropertyId, setFilterPropertyId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        const res = await adminUpdateServiceStatus(id, newStatus);
        setUpdatingId(null);

        if (res.error) {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        } else {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            toast({ title: "Estado Actualizado", description: `Solicitud marcada como ${newStatus}.` });
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'cleaning': return <Sparkles size={20} className="text-rose-500" />
            case 'maintenance': return <Wrench size={20} className="text-blue-500" />
            case 'concierge': return <Ship size={20} className="text-cyan-500" />
            default: return <Clock size={20} className="text-gray-400" />
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const handleViewCalendar = (propertyId: string) => {
        setFilterPropertyId(propertyId);
        setActiveTab('calendar');
    };

    const filteredBookings = filterPropertyId
        ? bookings.filter(b => b.property_id === filterPropertyId)
        : bookings;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* 1. Admin Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                            Command Center
                        </h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            {requests.length} Solicitudes Pendientes de Operación
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-end border-b border-gray-200 mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'requests' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Solicitudes ({requests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'calendar' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Calendario Global
                        </button>
                    </div>

                    {activeTab === 'calendar' && filterPropertyId && (
                        <Button
                            variant="ghost"
                            onClick={() => setFilterPropertyId(null)}
                            className="mb-2 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                            <X size={14} className="mr-1" /> Borrar Filtro
                        </Button>
                    )}
                </div>

                {activeTab === 'requests' ? (
                    /* 2. Requests Feed */
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {requests.map((req, index) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row"
                                >
                                    {/* Left: Service Type Info */}
                                    <div className="p-6 flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                            {getIcon(req.service_type)}
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        #{req.id.slice(0, 5)}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 leading-none">
                                                    {req.service_type === 'cleaning' ? 'Limpieza de Unidad' :
                                                        req.service_type === 'maintenance' ? 'Ticket de Mantenimiento' : 'Concierge VIP'}
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Home size={14} className="text-gray-400" />
                                                        <span className="font-bold">{req.properties?.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <User size={14} />
                                                        <span>Prop ID: {req.properties?.id.slice(0, 8)}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-medium text-gray-600 italic">"{req.notes}"</p>
                                                    {req.requested_date && (
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                            Agenda: {new Date(req.requested_date).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Admin Actions */}
                                    <div className="bg-gray-50/50 p-6 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center gap-2 min-w-[200px]">
                                        {req.status === 'pending' && (
                                            <Button
                                                onClick={() => handleStatusUpdate(req.id, 'confirmed')}
                                                disabled={updatingId === req.id}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-sm"
                                            >
                                                {updatingId === req.id ? <Loader2 className="animate-spin" /> : "Confirmar Visita"}
                                            </Button>
                                        )}
                                        {req.status === 'confirmed' && (
                                            <Button
                                                onClick={() => handleStatusUpdate(req.id, 'completed')}
                                                disabled={updatingId === req.id}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-sm"
                                            >
                                                {updatingId === req.id ? <Loader2 className="animate-spin" /> : "Finalizar Servicio"}
                                            </Button>
                                        )}
                                        {req.status === 'completed' && (
                                            <div className="flex flex-col items-center gap-2 py-2">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <Check size={20} />
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Atendido</span>
                                            </div>
                                        )}


                                        <RequestDetailsModal
                                            request={req}
                                            onViewCalendar={handleViewCalendar}
                                            triggerButton={
                                                <Button variant="ghost" className="w-full text-[10px] font-bold text-gray-400 hover:text-gray-900 group">
                                                    Detalles Completos <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Button>
                                            }
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {requests.length === 0 && (
                            <div className="bg-white rounded-3xl p-20 border border-gray-100 text-center space-y-4 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Todo al día</h3>
                                    <p className="text-sm text-gray-400">No hay solicitudes pendientes de gestión.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 3. Calendar View */
                    <div className="space-y-4">
                        {filteredBookings.length === 0 ? (
                            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
                                <p className="text-gray-500 font-medium">
                                    {filterPropertyId
                                        ? "Esta propiedad no tiene reservas futuras."
                                        : "No hay reservas registradas en el sistema."}
                                </p>
                                {filterPropertyId && (
                                    <Button variant="link" onClick={() => setFilterPropertyId(null)} className="mt-2 text-blue-600">
                                        Ver todas las propiedades
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {filteredBookings.map((booking: any) => (
                                    <div key={booking.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-indigo-900">{booking.properties?.title || "Propiedad Desconocida"}</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                                                <span className="flex items-center gap-1"><User size={12} /> {booking.guest_name || booking.profiles?.full_name || "Huésped"}</span>
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 rounded-full border border-gray-100">
                                                    Plataforma: {booking.platform}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
