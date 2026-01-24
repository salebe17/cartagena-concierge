"use client";

import { motion } from "framer-motion";
import { Sparkles, Wrench, Ship, Users, Clock, ArrowRight, MapPin, Star } from "lucide-react";
import Image from "next/image";

interface DashboardViewProps {
    userName: string;
    properties: any[];
}

export function DashboardView({ userName, properties }: DashboardViewProps) {
    // Default fallback if no properties
    const activeProperty = properties?.[0] || {
        title: "Edificio Morros Epic - Apto 902",
        address: "La Boquilla, Cartagena",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* 1. Welcome Section */}
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hola, {userName} 👋</h1>
                        <p className="text-gray-500 font-medium">Tu operación en Cartagena está activa.</p>
                    </div>
                </div>

                {/* 2. Active Property Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow cursor-pointer group"
                >
                    {/* Photo */}
                    <div className="w-full md:w-64 h-48 relative rounded-xl overflow-hidden shrink-0">
                        <Image
                            src={activeProperty.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"}
                            alt="Active Property"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-600 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Ocupado
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-2 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{activeProperty.title}</h2>
                                    <div className="flex items-center gap-1 text-gray-400 mt-1 mb-4">
                                        <MapPin size={14} />
                                        <span className="text-sm">{activeProperty.address || "Cartagena de Indias"}</span>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Check-out</p>
                                    <p className="text-sm font-bold text-gray-900">Mañana, 11:00 AM</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                    <Image src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" alt="Guest" fill />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Familia Rodríguez</p>
                                    <p className="text-xs text-green-600 font-medium">Huésped Verificado</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Star size={14} className="fill-orange-400 text-orange-400" /> 4.98</span>
                                <span>•</span>
                                <span>32 Reseñas</span>
                            </div>
                            <span className="text-sm font-bold text-[#FF5A5F] group-hover:underline">Ver detalles &rarr;</span>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Quick Actions Grid */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Gestión Rápida</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "Limpieza Express", icon: Sparkles, color: "text-rose-500", bg: "bg-rose-50" },
                            { title: "Mantenimiento", icon: Wrench, color: "text-blue-500", bg: "bg-blue-50" },
                            { title: "Concierge VIP", icon: Ship, color: "text-cyan-500", bg: "bg-cyan-50" },
                            { title: "Acceso Huésped", icon: Users, color: "text-amber-500", bg: "bg-amber-50" }
                        ].map((item, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:border-[#FF5A5F] hover:shadow-md transition-all group"
                            >
                                <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                    <item.icon size={26} strokeWidth={2} />
                                </div>
                                <span className="font-bold text-gray-700 group-hover:text-[#FF5A5F] transition-colors">{item.title}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* 4. Recent Activity */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                        <div className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                <Sparkles size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">Limpieza Completada</p>
                                <p className="text-xs text-gray-500">Edificio Morros Epic - Apto 902</p>
                            </div>
                            <span className="text-xs font-medium text-gray-400">Hace 2h</span>
                        </div>
                        <div className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Users size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">Check-in Confirmado</p>
                                <p className="text-xs text-gray-500">Familia Rodríguez (4 Pax)</p>
                            </div>
                            <span className="text-xs font-medium text-gray-400">Ayer</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
