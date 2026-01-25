"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Sparkles, User, Info, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

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
    onScheduleCleaning: (booking: Booking) => void;
}

export function CalendarGrid({ bookings, onScheduleCleaning }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Grid Calculation
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Helper: Find bookings for a specific day
    const getBookingsForDay = (day: Date) => {
        return bookings.filter(b => {
            // Basic overlap check. Note: start_date/end_date are strings YYYY-MM-DD
            // We treat them carefully to avoid timezone issues.
            // Best way: check if day string YYYY-MM-DD lies between start and end.
            const dayStr = format(day, "yyyy-MM-dd");
            return dayStr >= b.start_date && dayStr <= b.end_date;
        });
    };

    const getPlatformColor = (platform: string) => {
        if (platform.toLowerCase().includes('airbnb')) return 'bg-rose-100 text-rose-700 border-rose-200';
        if (platform.toLowerCase().includes('direct')) return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-purple-100 text-purple-700 border-purple-200'; // iCal Sync default
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 capitalize flex items-center gap-2">
                    <CalendarIcon className="text-rose-500" />
                    {mounted ? format(currentDate, "MMMM yyyy", { locale: es }) : "Cargando..."}
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

            {/* Week Days */}
            <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-100">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-px border-b border-gray-100">
                {calendarDays.map((day, dayIdx) => {
                    const dayBookings = getBookingsForDay(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[120px] bg-white p-2 flex flex-col gap-1 transition-colors ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday && mounted ? 'bg-gray-900 text-white' : ''}`}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            {/* Booking Pills */}
                            <div className="space-y-1 mt-1 overflow-y-auto max-h-[90px] no-scrollbar">
                                {dayBookings.map(booking => (
                                    <motion.button
                                        key={booking.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setSelectedBooking(booking)}
                                        className={`w-full text-left text-[10px] font-bold px-2 py-1 rounded border truncate shadow-sm ${getPlatformColor(booking.platform)} ${!isCurrentMonth ? 'opacity-50' : ''}`}
                                    >
                                        {booking.properties?.title || "Casa"}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    );
                })}
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
        </div>
    );
}
