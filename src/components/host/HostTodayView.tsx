'use client';

import { differenceInDays } from "date-fns";
import { User, Clock, CheckCircle2, CloudSun, CloudRain, Sun, Wind, Sparkles, Wrench, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface HostTodayViewProps {
    bookings: any[];
    alerts: any[];
    services?: any[];
    userName: string;
}

export function HostTodayView({ bookings, alerts, services = [], userName }: HostTodayViewProps) {
    const [mounted, setMounted] = useState(false);
    // Default generic weather while loading
    const [weather, setWeather] = useState<{ temp: number, code: number } | null>({ temp: 30, code: 1 });
    const [loadingWeather, setLoadingWeather] = useState(true);

    useEffect(() => {
        setMounted(true);
        // Fetch Cartagena Weather
        fetch('https://api.open-meteo.com/v1/forecast?latitude=10.3997&longitude=-75.5144&current=temperature_2m,weather_code&timezone=America%2FBogota')
            .then(res => res.json())
            .then(data => {
                if (data.current) {
                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        code: data.current.weather_code
                    });
                }
            })
            .catch(e => console.error("Weather error:", e))
            .finally(() => setLoadingWeather(false));
    }, []);

    // 1. Find Active Booking
    const today = new Date();
    const activeBooking = bookings.find(b => {
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        return today >= start && today <= end;
    });

    const daysLeft = activeBooking ? differenceInDays(new Date(activeBooking.end_date), today) : 0;

    // 2. Filter Active/Upcoming Services
    const activeServices = services.filter(s => {
        const sDate = new Date(s.requested_date);
        const isFuture = sDate >= new Date(today.setHours(0, 0, 0, 0));
        const isActiveStatus = ['pending', 'in_progress'].includes(s.status);
        return isActiveStatus;
    }).slice(0, 3);

    // Weather Icon Logic
    const getWeatherIcon = (code: number) => {
        if (code <= 3) return <Sun className="text-amber-500" size={24} />;
        if (code <= 48) return <CloudSun className="text-gray-500" size={24} />;
        if (code >= 51) return <CloudRain className="text-blue-500" size={24} />;
        return <Wind className="text-gray-400" size={24} />;
    };

    if (!mounted) return <div className="p-10 text-center animate-pulse">Cargando tablero...</div>;

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* Header with Weather */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[#222222] tracking-tight mb-1">
                        <div className="flex items-center gap-2">
                            {activeBooking ? "Propiedad Ocupada" : "Lista para huéspedes"}
                            <span className="text-xs bg-gray-100 text-gray-500 px-1 rounded border border-gray-200">v2.1</span>
                        </div>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Estado operativo al día de hoy</p>
                </div>

                {/* Weather Widget (Always Visible) */}
                <div className={`bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-2 flex items-center gap-3 transition-opacity ${loadingWeather ? 'opacity-50' : 'opacity-100'}`}>
                    {weather ? getWeatherIcon(weather.code) : <Sun className="text-amber-500" size={24} />}
                    <div>
                        <p className="text-xl font-black text-[#222222] leading-none">{weather?.temp || 30}°C</p>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cartagena</p>
                    </div>
                </div>
            </div>

            {/* URGENT ALERTS SECTION */}
            {alerts.length > 0 && (
                <div className="mb-8 space-y-3">
                    {alerts.map(alert => (
                        <div key={alert.id} className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl flex items-start gap-3 shadow-sm animate-pulse">
                            <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h3 className="text-rose-700 font-bold text-sm">Atención inmediata requerida</h3>
                                <p className="text-rose-800 text-sm leading-tight mt-1">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* HERO STATUS CARD */}
            {activeBooking ? (
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 text-center relative overflow-hidden">
                    <div className="flex justify-center items-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center animate-bounce-slow">
                            <User size={32} className="text-indigo-500" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-[#222222] leading-tight mb-2">
                        Estadía en Curso
                    </h2>
                    <p className="text-sm font-medium text-gray-500 max-w-xs mx-auto mb-6">
                        Hospedaje activo hasta el {new Date(activeBooking.end_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                    </p>

                    <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-5 py-2 rounded-full text-xs font-bold shadow-sm">
                        <Clock size={14} />
                        Checkout en {daysLeft > 0 ? `${daysLeft} días` : "el día de hoy"}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] p-12 border border-gray-100 text-center mb-10 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 group-hover:h-3 transition-all"></div>
                    <CheckCircle2 size={48} className="mx-auto mb-6 text-emerald-500" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Todo en orden</h3>
                    <p className="text-gray-500 text-sm max-w-[250px] mx-auto">
                        La propiedad está vacía, limpia y lista para recibir reservaciones.
                    </p>
                </div>
            )}

            {/* OPERATIONAL ACTIVITY */}
            <h2 className="text-xl font-black text-[#222222] mb-6 flex items-center gap-2">
                Operaciones Activas
            </h2>

            <div className="space-y-4">
                {activeServices.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                        <p className="text-sm font-medium text-gray-400">No hay servicios de limpieza o mantenimiento pendientes.</p>
                    </div>
                ) : null}

                {activeServices.map((svc) => (
                    <div key={svc.id} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex justify-between items-center transitiion-all hover:scale-[1.01]">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${svc.service_type === 'cleaning' ? 'bg-cyan-50 text-cyan-500' : 'bg-orange-50 text-orange-500'}`}>
                                {svc.service_type === 'cleaning' ? <Sparkles size={22} /> : <Wrench size={22} />}
                            </div>
                            <div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${svc.status === 'in_progress' ? 'text-amber-500 animate-pulse' : 'text-gray-400'}`}>
                                    {svc.status === 'in_progress' ? '● En Curso' : 'Programado'}
                                </div>
                                <div className="font-bold text-[#222222] text-base leading-tight">
                                    {svc.service_type === 'cleaning' ? 'Limpieza General' : 'Mantenimiento'}
                                </div>
                                <div className="text-xs text-gray-400 capitalize bg-gray-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                    {new Date(svc.requested_date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })} • {new Date(svc.requested_date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
