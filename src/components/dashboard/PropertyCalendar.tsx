"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";
import { blockPropertyDate, getPropertyBookings } from "@/app/actions";

export function PropertyCalendar({ propertyId }: { propertyId: string }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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
        // Construct date object
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

        // Prevent blocking past dates
        if (clickedDate < new Date(new Date().setHours(0, 0, 0, 0))) return alert("No puedes bloquear fechas pasadas");

        setLoading(true);
        try {
            await blockPropertyDate(propertyId, clickedDate);
            await fetchBookings(); // Refresh
        } catch (e) {
            console.error(e);
            alert("Error actualizando calendario");
        } finally {
            setLoading(false);
        }
    };

    const getDayStatus = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        const booking = bookings.find(b => {
            // Simple interaction check (assuming single day blocks as per MVP action)
            // Real logic would check ranges: start <= date <= end
            return b.start_date === dateStr;
        });

        if (booking) {
            return {
                type: booking.status, // 'blocked' or 'confirmed'
                label: booking.platform // 'Direct', 'Airbnb', etc
            };
        }
        return null;
    };

    const renderDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);

        // Blank spaces for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-transparent border border-white/5 opacity-50"></div>);
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const status = getDayStatus(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-24 border border-white/5 p-2 relative group hover:bg-white/5 transition-colors cursor-pointer
                        ${isToday ? 'bg-yellow-500/10' : ''}
                        ${status?.type === 'blocked' ? 'bg-red-500/10' : ''}
                        ${status?.type === 'confirmed' ? 'bg-green-500/10' : ''}
                    `}
                >
                    <span className={`text-sm font-bold ${isToday ? 'text-yellow-500' : 'text-gray-400'}`}>{day}</span>

                    {/* Status Indicator */}
                    {status && (
                        <div className={`mt-2 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider
                            ${status.type === 'blocked' ? 'text-red-400 bg-red-500/20' : 'text-green-400 bg-green-500/20'}
                        `}>
                            {status.label || status.type}
                        </div>
                    )}

                    {/* Hover Action */}
                    {!status && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Lock className="w-4 h-4 text-gray-500" />
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden animate-in fade-in duration-500">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">
                    {currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-lg text-white"><ChevronLeft /></button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-lg text-white"><ChevronRight /></button>
                </div>
            </div>

            {/* Week Headers */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-black/40">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div key={d} className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 bg-black/20">
                {renderDays()}
            </div>

            {/* Legend / Footer */}
            <div className="p-4 border-t border-white/10 flex gap-6 text-xs text-gray-500 justify-end">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/20 rounded-sm"></div>
                    <span>Bloqueado (Manual / Airbnb)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500/20 rounded-sm"></div>
                    <span>Reserva Confirmada</span>
                </div>
            </div>
        </div>
    );
}
