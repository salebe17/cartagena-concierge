"use client";

import { useState } from "react";
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
import { ServiceRequest } from "@/lib/types";

interface AdminDashboardViewProps {
    requests: ServiceRequest[];
    bookings?: any[];
}

export function AdminDashboardView({ requests: initialRequests, bookings = [] }: AdminDashboardViewProps) {
    const [requests, setRequests] = useState(initialRequests);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
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

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                        Command Center (Modo Seguro)
                    </h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        {requests.length} Solicitudes | {bookings.length} Reservas
                    </p>
                </div>

                {/* Simple List - No Tabs, No Animation */}
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row p-6 items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                {getIcon(req.service_type)}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">#{req.id.slice(0, 5)}</span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900">
                                    {req.service_type}
                                </h3>

                                <div className="text-sm text-gray-500">
                                    <p><span className="font-bold">Propiedad:</span> {req.properties?.title}</p>
                                    <p className="italic">"{req.notes}"</p>
                                </div>

                                <div className="pt-2 flex gap-2">
                                    {req.status === 'pending' && (
                                        <Button
                                            onClick={() => handleStatusUpdate(req.id, 'confirmed')}
                                            disabled={updatingId === req.id}
                                            className="bg-blue-600 h-8 text-xs"
                                        >
                                            Confirmar
                                        </Button>
                                    )}
                                    {req.status === 'confirmed' && (
                                        <Button
                                            onClick={() => handleStatusUpdate(req.id, 'completed')}
                                            disabled={updatingId === req.id}
                                            className="bg-emerald-600 h-8 text-xs"
                                        >
                                            Finalizar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
