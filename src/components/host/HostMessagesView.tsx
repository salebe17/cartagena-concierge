'use client';

import { Search, Settings, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HostMessagesViewProps {
    bookings: any[];
}

export function HostMessagesView({ bookings }: HostMessagesViewProps) {
    // Determine active vs past bookings for "status" simulation
    // We will just map bookings to 'threads'
    const threads = bookings.map(b => {
        const isStayActive = new Date() >= new Date(b.start_date) && new Date() <= new Date(b.end_date);
        const isUpcoming = new Date() < new Date(b.start_date);

        return {
            id: b.id,
            guestName: b.guest_name || "Huésped",
            guestAvatarData: b.guest_name ? b.guest_name.charAt(0) : "H",
            propertyTitle: b.properties?.title || "Propiedad",
            propertyImage: b.properties?.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100",
            lastMessage: isStayActive ? "Todo excelente, muchas gracias." : isUpcoming ? "Nos vemos pronto!" : "Gracias por la estadía.",
            time: "Ayer", // Mock time
            status: isStayActive ? 'Estadía en curso' : isUpcoming ? 'Solicitud de reserva' : 'Salida completada',
            statusColor: isStayActive ? 'green' : isUpcoming ? 'red' : 'gray',
            dateRange: `${format(new Date(b.start_date), "d 'de' MMM", { locale: es })} – ${format(new Date(b.end_date), "d 'de' MMM", { locale: es })}`
        };
    });

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-black text-[#222222] tracking-tight">Mensajes</h1>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <Search size={20} className="text-[#222222]" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <Settings size={20} className="text-[#222222]" />
                    </button>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                <button className="bg-[#222222] text-white px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                    Todos
                </button>
                <button className="bg-gray-100 text-[#222222] px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                    Anfitrión
                </button>
                <button className="bg-gray-100 text-[#222222] px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                    Modo viajero
                </button>
                <button className="bg-gray-100 text-[#222222] px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                    Coanfitrión
                </button>
            </div>

            {/* Messages List */}
            <div className="space-y-6">
                {threads.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No tienes mensajes aún.</div>
                ) : (
                    threads.map((thread, i) => (
                        <div key={thread.id} className="flex gap-4 group cursor-pointer">
                            {/* Avatar Stack */}
                            <div className="relative shrink-0 w-14 h-14">
                                {/* Main Avatar */}
                                <div className="w-14 h-14 rounded-full bg-[#222222] flex items-center justify-center text-white font-bold text-xl border border-gray-100 overflow-hidden">
                                    {/* Try to detect if name is 'Airbnb' to use logo, else initial */}
                                    {thread.guestName.toLowerCase().includes("airbnb") ? "A" : thread.guestAvatarData}
                                </div>
                                {/* Property Thumb overlay */}
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-white p-0.5 shadow-sm overflow-hidden">
                                    <img src={thread.propertyImage} className="w-full h-full object-cover rounded-md" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 border-b border-gray-100 pb-6 group-last:border-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="text-base font-bold text-[#222222] truncate pr-2">
                                        {thread.guestName}
                                    </h3>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{thread.time}</span>
                                </div>

                                <p className="text-sm text-[#222222] truncate font-light mb-1">
                                    {thread.guestName}: {thread.lastMessage}
                                </p>

                                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate mt-1.5">
                                    {thread.statusColor !== 'gray' && (
                                        <div className={`w-2 h-2 rounded-full ${thread.statusColor === 'green' ? 'bg-green-600' : 'bg-red-500'}`}></div>
                                    )}
                                    <span className="truncate">
                                        {thread.status} · {thread.dateRange} · {thread.propertyTitle}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
