"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Camera, Clock, User, CheckCircle2 } from "lucide-react";
import { ServiceRequest } from "@/lib/types";

// Helper type for the extended request (includes logs)
interface ExtendedServiceRequest extends ServiceRequest {
    service_logs?: {
        id: string;
        started_at: string;
        ended_at?: string;
        staff_name?: string;
        notes?: string;
        start_photos?: string[];
        end_photos?: string[];
    }[];
}

interface LogDetailsModalProps {
    request: ExtendedServiceRequest;
    triggerButton?: React.ReactNode;
}

export function LogDetailsModal({ request, triggerButton }: LogDetailsModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const log = request.service_logs && request.service_logs.length > 0 ? request.service_logs[0] : null;

    if (!log) return null;

    const startTime = mounted ? new Date(log.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
    const endTime = log.ended_at && mounted ? new Date(log.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (log.ended_at ? "--:--" : "En progreso");

    return (
        <Dialog>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button size="sm" variant="outline" className="text-xs">
                        <Camera size={14} className="mr-2" /> Ver Evidencia
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <CheckCircle2 className="text-emerald-500" /> Reporte de Servicio
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* INFO HEADER */}
                    <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <User size={12} /> Encargado
                            </div>
                            <p className="font-medium text-gray-900">{log.staff_name || "Sin nombre"}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <Clock size={12} /> Duración
                            </div>
                            <p className="font-medium text-gray-900">
                                {startTime} - {endTime}
                            </p>
                        </div>
                    </div>

                    {/* PHOTOS */}
                    {log.end_photos && log.end_photos.length > 0 ? (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Camera size={16} /> Evidencia Fotográfica
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {log.end_photos.map((url, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-100 relative group">
                                        <img src={url} alt={`Evidencia ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                            <p className="text-gray-400 text-sm">Sin evidencia fotográfica registrada.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
