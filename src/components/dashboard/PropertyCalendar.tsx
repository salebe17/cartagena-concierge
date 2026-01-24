"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Trash2, CalendarDays } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { getPropertyBookings, blockPropertyRange, deleteBooking } from "@/app/actions";

export function PropertyCalendar({ propertyId }: { propertyId: string }) {
    const account = useActiveAccount();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Selection Range
    const [range, setRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });

    const fetchBookings = async () => {
        const data = await getPropertyBookings(propertyId);
        setBookings(data || []);
    };

    useEffect(() => {
        fetchBookings();
    }, [propertyId]);

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = async (day: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (clickedDate < new Date(new Date().setHours(0, 0, 0, 0))) return;

        // If clicking an existing booking, maybe show details (or delete if it's a block)
        const existing = getBookingForDay(day);
        if (existing) {
            if (confirm("¿Desbloquear esta fecha?")) {
                await deleteBooking(existing.id);
                fetchBookings();
            }
            return;
        }

        // Range Logic
        if (!range.start || (range.start && range.end)) {
            setRange({ start: clickedDate, end: null });
        } else {
            // End date clicked
            if (clickedDate < range.start) {
                setRange({ start: clickedDate, end: range.start });
            } else {
                setRange({ ...range, end: clickedDate });
            }
        }
    };

    const handleBlockRange = async () => {
        if (!range.start || !range.end || !account?.address) return;
        setLoading(true);
        try {
            const res = await blockPropertyRange(propertyId, range.start, range.end, account.address);
            if (res.error) alert(res.error);
            else {
                setRange({ start: null, end: null });
                fetchBookings();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const getBookingForDay = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        // Check if date falls within any booking start/end
        return bookings.find(b => dateStr >= b.start_date && dateStr <= b.end_date);
    };

    const isDateInRange = (day: number) => {
        if (!range.start) return false;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (range.end) {
            return date >= range.start && date <= range.end;
        }
        return date.getTime() === range.start.getTime();
    };

    const renderDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-transparent border border-white/5 opacity-50"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const booking = getBookingForDay(day);
            const isSelected = isDateInRange(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-24 border border-white/5 p-2 relative group hover:bg-white/5 transition-colors cursor-pointer select-none
                        ${isSelected ? 'bg-yellow-500/20' : ''}
                        ${booking?.status === 'blocked' ? 'bg-red-900/10' : ''}
                        ${booking?.status === 'confirmed' ? 'bg-green-900/10' : ''}
                    `}
                >
                    <span className={`text-sm font-bold ${isToday ? 'text-yellow-500' : 'text-gray-500'}`}>{day}</span>

                    {/* Booking Indicator */}
                    {booking && (
                        <div className={`mt-2 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider truncate
                            ${booking.status === 'blocked' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}
                         `}>
                            {booking.status === 'blocked' ? 'Bloqueado' : 'Reserva'}
                        </div>
                    )}

                    {!booking && isSelected && (
                        <div className="absolute bottom-2 right-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-gray-500" />
                    {currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' })}
                </h2>

                {range.start && range.end && (
                    <div className="flex items-center gap-4 animate-in slide-in-from-top-2 fade-in">
                        <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest hidden md:inline-block">
                            {range.start.getDate()} - {range.end.getDate()} Seleccionados
                        </span>
                        <button
                            onClick={handleBlockRange}
                            disabled={loading}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                            {loading ? "..." : "Bloquear Fechas"} <Lock className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-lg text-white"><ChevronLeft /></button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-lg text-white"><ChevronRight /></button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-black/40">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div key={d} className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 bg-black/20">
                {renderDays()}
            </div>
        </div>
    );
}
