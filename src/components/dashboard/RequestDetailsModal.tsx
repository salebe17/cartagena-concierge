
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceRequest } from "@/lib/types";
import { MapPin, User, Calendar, FileText, Clock, Phone, MessageCircle } from "lucide-react";
import { ChatBox } from "../chat/ChatBox";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface RequestDetailsModalProps {
    request: ServiceRequest;
    triggerButton: React.ReactNode;
    onViewCalendar?: (propertyId: string) => void;
}

export function RequestDetailsModal({ request, triggerButton, onViewCalendar }: RequestDetailsModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showChat, setShowChat] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const getU = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getU();
    }, []);

    const handleViewCalendar = () => {
        if (onViewCalendar && request.property_id) {
            setIsOpen(false);
            onViewCalendar(request.property_id);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <span className="bg-gray-100 rounded-lg p-2 text-gray-500">
                            #{request.id.slice(0, 5)}
                        </span>
                        Detalles de Solicitud
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Property Card */}
                    <div className="bg-gray-50 p-4 rounded-2xl flex gap-4 items-center justify-between group">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm">
                                <HomeIcon />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{request.properties?.title || "Propiedad Desconocida"}</h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin size={12} /> {request.properties?.address}
                                </p>
                            </div>
                        </div>
                        {onViewCalendar && (
                            <button
                                onClick={handleViewCalendar}
                                className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                Ver Calendario
                            </button>
                        )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem
                            icon={<Calendar size={14} />}
                            label="Fecha Solicitada"
                            value={request.requested_date && mounted ? new Date(request.requested_date).toLocaleString() : (request.requested_date ? '--/--/----' : 'N/A')}
                        />
                        <InfoItem
                            icon={<Clock size={14} />}
                            label="Estado Actual"
                            value={request.status.toUpperCase()}
                            highlight={request.status === 'pending' ? 'text-yellow-600' : 'text-emerald-600'}
                        />
                    </div>

                    {/* User Info (If available in updated schema, fallback to owner_id) */}
                    <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Solicitante</h5>
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Owner ID: {request.properties?.owner_id.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </div>


                    {/* Notes Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notas / Requerimientos</h5>
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5
                                    ${showChat ? 'bg-gray-900 text-white' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                            >
                                <MessageCircle size={12} />
                                {showChat ? 'Ver Detalles' : 'Contactar Soporte'}
                            </button>
                        </div>

                        {!showChat ? (
                            <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 text-yellow-900 text-sm font-medium italic">
                                "{request.notes || 'Sin notas adicionales'}"
                            </div>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                {currentUser ? (
                                    <ChatBox requestId={request.id} currentUserId={currentUser.id} />
                                ) : (
                                    <div className="h-40 flex items-center justify-center text-gray-400 text-xs italic">Cargando chat...</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoItem({ icon, label, value, highlight }: any) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                {icon} {label}
            </span>
            <p className={`text-sm font-bold ${highlight || 'text-gray-900'}`}>{value}</p>
        </div>
    )
}

function HomeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    )
}
