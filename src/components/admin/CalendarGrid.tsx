"use client";

import { useState, useEffect } from "react";
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Sparkles, User, Info, Calendar as CalendarIcon, Wrench, Trash2, Edit2, Save, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteServiceRequest, updateServiceRequest } from "@/app/actions/admin_services";

// Types
interface Booking {
    id: string;
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
    guest_name?: string;
    platform: string;
    status: string;
    properties?: {
        id: string;
        title: string;
    };
}

interface CalendarGridProps {
    bookings: Booking[];
    services?: any[]; // ServiceRequest[]
    onScheduleCleaning: (booking: Booking) => void;
}

export function CalendarGrid({ bookings, services = [], onScheduleCleaning }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [mounted, setMounted] = useState(false);

    // Edit/Delete States
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [editNotes, setEditNotes] = useState("");
    const { toast } = useToast();

    // Reset edit state on close
    useEffect(() => {
        if (!selectedService) {
            setIsEditing(false);
            setEditNotes("");
        } else {
            setEditNotes(selectedService.notes || "");
        }
    }, [selectedService]);

    const handleDeleteService = async () => {
        if (!selectedService) return;
        if (!confirm("¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.")) return;

        setIsProcessing(true);
        const res = await deleteServiceRequest(selectedService.id);
        setIsProcessing(false);

        if (res.success) {
            toast({ title: "Eliminado", description: "El servicio ha sido eliminado." });
            setSelectedService(null);
            // Ideally trigger a refresh of data or optimistic update, 
            // but the parent passes `services` prop. 
            // `revalidatePath` in action should update the parent server component, 
            // causing a prop update here if it's a server component tree. 
            // If Client Component, we rely on parent re-render.
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    const handleUpdateService = async () => {
        if (!selectedService) return;
        setIsProcessing(true);
        const res = await updateServiceRequest(selectedService.id, { notes: editNotes });
        setIsProcessing(false);

        if (res.success) {
            toast({ title: "Actualizado", description: "Información guardada." });
            setIsEditing(false);
            setSelectedService(null); // Close to refresh? Or keep open with new data? 
            // Since props come from parent, local state `selectedService` might be stale.
            // Closing is safer.
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:flex p-6 items-center justify-between border-b border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 capitalize flex items-center gap-2">
                    <CalendarIcon className="text-rose-500" />
                    <span suppressHydrationWarning>{format(currentDate, "MMMM yyyy", { locale: es })}</span>
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft size={20} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            {/* Mobile Header (Simple Title, no Nav) */}
            <div className="md:hidden p-6 border-b border-gray-100 sticky top-0 bg-white z-20">
                <h2 className="text-2xl font-black text-gray-900 capitalize flex items-center gap-2">
                    <CalendarIcon className="text-rose-500" />
                    Calendario
                </h2>
            </div>

            {/* Week Days Header - Sticky on Mobile */}
            <div className="grid grid-cols-7 bg-gray-50/95 backdrop-blur border-b border-gray-100 sticky top-[80px] md:static z-10 w-full">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Content Container */}
            <div className="bg-gray-100">
                {/* Desktop View: Single Month */}
                <div className="hidden md:grid grid-cols-7 auto-rows-fr gap-px bg-gray-100 border-b border-gray-100">
                    <MonthDays
                        baseDate={currentDate}
                        bookings={bookings}
                        services={services}
                        mounted={mounted}
                        onBookingClick={setSelectedBooking}
                        onServiceClick={setSelectedService}
                    />
                </div>

                {/* Mobile View: Vertical Scroll (12 Months) */}
                <div className="md:hidden flex flex-col gap-2">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const monthDate = addMonths(new Date(), i);
                        return (
                            <div key={i} className="bg-white pb-8">
                                <div className="p-4 font-black text-lg text-gray-900 capitalize bg-white sticky top-[125px] z-10 border-b border-gray-50">
                                    {format(monthDate, "MMMM yyyy", { locale: es })}
                                </div>
                                <div className="grid grid-cols-7 auto-rows-fr gap-px bg-gray-100 border-b border-gray-100">
                                    <MonthDays
                                        baseDate={monthDate}
                                        bookings={bookings}
                                        services={services}
                                        mounted={mounted}
                                        onBookingClick={setSelectedBooking}
                                        onServiceClick={setSelectedService}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Booking Detail Modal */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalles de Reserva</DialogTitle>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-6">
                            {/* Info Card */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                                        <User size={18} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{selectedBooking.guest_name || "Huésped"}</h4>
                                        <p className="text-xs text-gray-500 font-medium bg-white px-2 py-0.5 rounded-full inline-block border border-gray-100 shadow-sm mt-1">
                                            {selectedBooking.platform}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Llegada</p>
                                        <p className="font-medium text-gray-700">{selectedBooking.start_date}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Salida</p>
                                        <p className="font-medium text-gray-700">{selectedBooking.end_date}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded border border-gray-100 flex items-center gap-2 text-sm text-gray-600 font-medium">
                                    <Info size={16} className="text-blue-500" />
                                    Propiedad: {selectedBooking.properties?.title}
                                </div>
                            </div>

                            {/* Actions */}
                            <Button
                                onClick={() => {
                                    onScheduleCleaning(selectedBooking);
                                    setSelectedBooking(null);
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-base shadow-lg shadow-emerald-200"
                            >
                                <Sparkles className="mr-2" size={18} />
                                Programar Limpieza de Salida
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Service Detail Modal */}
            <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalle del Servicio {isEditing && "(Editando)"}</DialogTitle>
                    </DialogHeader>
                    {selectedService && (
                        <div className="space-y-4">
                            {/* Header Card */}
                            <div className={`p-4 rounded-xl border ${selectedService.service_type === 'cleaning' ? 'bg-teal-50 border-teal-100' : 'bg-orange-50 border-orange-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white ${selectedService.service_type === 'cleaning' ? 'text-teal-500' : 'text-orange-500'}`}>
                                        {selectedService.service_type === 'cleaning' ? <Sparkles size={24} /> : <Wrench size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 capitalize">{selectedService.service_type === 'cleaning' ? 'Limpieza Hotelera' : 'Mantenimiento'}</h4>
                                        <p className="text-sm text-gray-500">{format(parseISO(selectedService.requested_date), "PPPP", { locale: es })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Property Info */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Propiedad</p>
                                <p className="font-bold text-gray-700">{selectedService.properties?.title}</p>
                            </div>

                            {/* Editable Notes */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1 w-full flex justify-between">
                                    Notas
                                    {isEditing && <span className="text-rose-500 text-[10px]">Editando...</span>}
                                </p>
                                {isEditing ? (
                                    <textarea
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        className="w-full text-sm p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                                        rows={3}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-600">{selectedService.notes || "Sin notas adicionales."}</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-2">
                                {/* Left: Status Badge (Read-only for now) */}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedService.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    selectedService.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {selectedService.status === 'completed' ? 'Completado' : 'Pendiente'}
                                </span>

                                {/* Right: CRUD Actions */}
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isProcessing}>
                                                <X size={18} className="text-gray-500" />
                                            </Button>
                                            <Button size="sm" onClick={handleUpdateService} disabled={isProcessing} className="bg-black text-white hover:bg-gray-800">
                                                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                                <Edit2 size={16} className="text-gray-700" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={handleDeleteService} disabled={isProcessing}>
                                                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

const getPlatformColor = (platform: string) => {
    if (platform.toLowerCase().includes('airbnb')) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (platform.toLowerCase().includes('direct')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-purple-100 text-purple-700 border-purple-200';
};

interface MonthDaysProps {
    baseDate: Date;
    bookings: Booking[];
    services: any[];
    mounted: boolean;
    onBookingClick: (b: Booking) => void;
    onServiceClick: (s: any) => void;
}

function MonthDays({ baseDate, bookings, services, mounted, onBookingClick, onServiceClick }: MonthDaysProps) {
    const monthStart = startOfMonth(baseDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getBookingsForDay = (day: Date) => {
        return bookings.filter(b => {
            const dayStr = format(day, "yyyy-MM-dd");
            return dayStr >= b.start_date && dayStr <= b.end_date;
        });
    };

    const getServicesForDay = (day: Date) => {
        return services.filter(s => {
            if (!s.requested_date) return false;
            const serviceDay = format(parseISO(s.requested_date), "yyyy-MM-dd");
            const dayStr = format(day, "yyyy-MM-dd");
            return serviceDay === dayStr;
        });
    };

    return (
        <>
            {calendarDays.map((day) => {
                const dayBookings = getBookingsForDay(day);
                const dayServices = getServicesForDay(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                    <div
                        key={day.toString()}
                        className={`min-h-[120px] bg-white p-2 flex flex-col gap-1 transition-colors ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : ''}`}
                    >
                        <div className="flex justify-between items-start">
                            <span suppressHydrationWarning className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday && mounted ? 'bg-gray-900 text-white' : ''}`}>
                                {format(day, "d")}
                            </span>
                        </div>

                        <div className="space-y-1 mt-1 overflow-y-auto max-h-[90px] no-scrollbar">
                            {(dayBookings || []).map(booking => {
                                if (!booking || !booking.id) return null;
                                return (
                                    <motion.button
                                        key={booking.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => onBookingClick(booking)}
                                        className={`w-full text-left text-[10px] font-bold px-2 py-1 rounded border truncate shadow-sm ${getPlatformColor(booking.platform)} ${!isCurrentMonth ? 'opacity-50' : ''}`}
                                    >
                                        {booking.properties?.title || "Casa"}
                                    </motion.button>
                                );
                            })}
                            {(dayServices || []).map(svc => {
                                const isCleaning = svc.service_type === 'cleaning';
                                const colorClass = isCleaning
                                    ? 'bg-teal-50 text-teal-700 border-teal-100'
                                    : 'bg-orange-50 text-orange-700 border-orange-100';
                                const Icon = isCleaning ? Sparkles : Wrench;

                                return (
                                    <motion.button
                                        key={svc.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => onServiceClick(svc)}
                                        className={`w-full text-left text-[10px] font-bold px-2 py-1 rounded border truncate shadow-sm flex items-center gap-1 ${colorClass} ${!isCurrentMonth ? 'opacity-50' : ''}`}
                                    >
                                        <Icon size={10} className="shrink-0" />
                                        {isCleaning ? 'Aseo' : 'Mtto'}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
