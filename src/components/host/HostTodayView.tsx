'use client';

import { differenceInDays, parseISO } from "date-fns";
import { User, Clock, CheckCircle2 } from "lucide-react";

interface HostTodayViewProps {
    bookings: any[];
    alerts: any[];
    userName: string;
}

export function HostTodayView({ bookings, alerts, userName }: HostTodayViewProps) {
    // 1. Find Active Booking (Simulated for generic "Today" logic)
    // In a real app, we check if today is within a booking range.
    // For demo purposes, we pick the first "current" or generic active booking logic.

    // Logic: Find booking where today >= start_date and today < end_date
    const today = new Date();
    const activeBooking = bookings.find(b => {
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        return today >= start && today <= end;
    }) || bookings[0]; // Fallback to first booking for visual demo if no active one

    const daysLeft = activeBooking ? differenceInDays(new Date(activeBooking.end_date), today) : 0;
    const guestName = activeBooking?.guest_name?.split(' ')[0] || "Huésped";
    const guestsCount = activeBooking?.guests_count || 4; // Mock if missing

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* Header Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
                <button className="bg-[#222222] text-white px-6 py-2 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                    Hoy
                </button>
                <button className="bg-gray-100 text-gray-500 px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                    Reservaciones programadas
                </button>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-[#222222] mb-6 tracking-tight">
                {activeBooking ? "Tienes 1 reservación" : "Sin reservaciones activas"}
            </h1>

            {/* Active Reservation Card */}
            {activeBooking ? (
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 text-center relative overflow-hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Todo el día</p>

                    {/* Avatars */}
                    <div className="flex justify-center items-center -space-x-4 mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm z-10">
                            {/* Placeholder Guest Image */}
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                <User size={32} className="text-white" />
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center shadow-sm z-0">
                            <span className="font-bold text-gray-500 text-lg">+{guestsCount - 1}</span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-[#222222] leading-tight max-w-xs mx-auto mb-2">
                        El grupo de {guestName} compuesto por {guestsCount} viajeros
                    </h2>
                    <p className="text-2xl font-black text-[#222222] leading-tight max-w-xs mx-auto">
                        se queda {daysLeft > 0 ? `${daysLeft} días más` : "hasta hoy"}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] p-12 border border-gray-100 text-center mb-10 text-gray-400">
                    <Clock size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No hay huéspedes alojados hoy.</p>
                </div>
            )}

            {/* Pending Tasks */}
            <h2 className="text-xl font-black text-[#222222] mb-6">Tus tareas pendientes</h2>

            <div className="space-y-4">
                {/* Mock Task matching screenshot */}
                <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex justify-between items-center">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">En progreso</div>
                        <div className="font-bold text-[#222222] text-sm mb-1 line-clamp-2 leading-tight max-w-[200px]">
                            Se envió la solicitud de reembolso a Melanny Carolina
                        </div>
                        <div className="text-xs text-gray-400">
                            {activeBooking?.properties?.title || "Casa Moderna..."}
                        </div>
                    </div>
                    <div className="flex -space-x-2 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs border-2 border-white z-10">
                            M
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white">
                            {/* Property Thumb */}
                            <img src={activeBooking?.properties?.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100"} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Actual Alerts */}
                {alerts.map(alert => (
                    <div key={alert.id} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex justify-between items-center">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-1">Nueva Alerta</div>
                            <div className="font-bold text-[#222222] text-sm mb-1 leading-tight">
                                {alert.message}
                            </div>
                            <div className="text-xs text-gray-400">
                                {new Date(alert.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <CheckCircle2 size={24} className="text-gray-200" />
                    </div>
                ))}
            </div>
        </div>
    );
}
