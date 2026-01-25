"use client";

import { Search, MapPin, Home } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function HeroRegistrationWidget() {
    const [location, setLocation] = useState("Cartagena, Colombia");
    const [propertyType, setPropertyType] = useState("Apartamento Turístico");

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-2 max-w-lg w-full border border-gray-100 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Tabs */}
            <div className="flex gap-6 px-6 pt-4 pb-2">
                <button className="text-sm font-bold text-gray-900 border-b-2 border-gray-900 pb-1">
                    Registrar Propiedad
                </button>
                <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                    Solicitar Servicio
                </button>
            </div>

            {/* Main Inputs Container */}
            <div className="flex flex-col border border-gray-200 rounded-2xl mt-2 overflow-hidden shadow-sm divide-y divide-gray-200">

                {/* Location Input */}
                <div className="relative hover:bg-gray-50 transition-colors p-4 cursor-pointer group">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800 mb-0.5">Ubicación</div>
                    <input
                        type="text"
                        value={location}
                        readOnly
                        className="w-full bg-transparent text-sm text-gray-600 font-medium outline-none cursor-pointer group-hover:text-gray-900"
                    />
                    <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Type Input */}
                <div className="relative hover:bg-gray-50 transition-colors p-4 cursor-pointer group">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800 mb-0.5">Tipo de Propiedad</div>
                    <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full bg-transparent text-sm text-gray-600 font-medium outline-none cursor-pointer appearance-none group-hover:text-gray-900"
                    >
                        <option>Apartamento Turístico</option>
                        <option>Casa Colonial</option>
                        <option>Villa Privada</option>
                    </select>
                    <Home size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Big Action Button */}
            <div className="p-2 mt-2">
                <Link href="/register">
                    <button className="w-full bg-[#FF385C] hover:bg-[#D90B3E] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]">
                        <Search size={18} strokeWidth={2.5} />
                        <span className="text-base">Comenzar Registro</span>
                    </button>
                </Link>
            </div>
        </div>
    );
}
