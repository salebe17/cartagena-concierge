'use client';

import {
    Sparkles, // Limpieza
    Wrench,   // Mantenimiento
    Key,      // Cerrajería
    Droplets, // Plomería
    Zap,      // Electricidad
    Flame,    // Gas
    ShieldCheck, // Seguros
    Snowflake, // Refrigeración
    Shirt,    // Lavandería
    Utensils, // Menaje
    BedDouble, // Lenceria
    PaintRoller, // Acabados
} from "lucide-react";
import { RequestServiceModal } from "../dashboard/RequestServiceModal";

interface HostServicesViewProps {
    properties: any[];
}

export function HostServicesView({ properties }: HostServicesViewProps) {
    // Default to first property for now. In a real app, user might need to select property first if they have multiple.
    const defaultProperty = properties[0];

    const services = [
        { id: 'cleaning', label: 'Limpieza', icon: Sparkles, color: 'bg-teal-50 text-teal-600' },
        { id: 'maintenance', label: 'Mantenimiento', icon: Wrench, color: 'bg-orange-50 text-orange-600' },
        { id: 'interior_finishes', label: 'Acabado de Interiores', icon: PaintRoller, color: 'bg-emerald-50 text-emerald-600' },
        { id: 'keys', label: 'Cerrajería', icon: Key, color: 'bg-yellow-50 text-yellow-600' },
        { id: 'plumbing', label: 'Plomería', icon: Droplets, color: 'bg-blue-50 text-blue-600' },
        { id: 'electricity', label: 'Electricidad', icon: Zap, color: 'bg-amber-50 text-amber-600' },
        { id: 'gas', label: 'Gas', icon: Flame, color: 'bg-red-50 text-red-600' },
        { id: 'insurance', label: 'Seguros', icon: ShieldCheck, color: 'bg-indigo-50 text-indigo-600' },
        { id: 'refrigeration', label: 'Refrigeración', icon: Snowflake, color: 'bg-cyan-50 text-cyan-600' },
        { id: 'laundry', label: 'Lavandería', icon: Shirt, color: 'bg-purple-50 text-purple-600' },
        { id: 'houseware', label: 'Menaje', icon: Utensils, color: 'bg-stone-50 text-stone-600' },
        { id: 'linens', label: 'Lenceria', icon: BedDouble, color: 'bg-pink-50 text-pink-600' },
    ];

    if (!defaultProperty) {
        return <div className="p-8 text-center text-gray-500">No hay propiedades registradas.</div>;
    }

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-[#222222] tracking-tight mb-6">Servicios</h1>
            <p className="text-gray-500 mb-6 -mt-4">Solicita asistencia técnica o servicios para tu propiedad.</p>

            <div className="grid grid-cols-3 gap-4">
                {services.map((svc) => {
                    const Icon = svc.icon;
                    return (
                        <RequestServiceModal
                            key={svc.id}
                            propertyId={defaultProperty.id}
                            propertyName={defaultProperty.title}
                            serviceType={svc.id}
                            triggerButton={
                                <button
                                    className={`w-full flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-black transition-all aspect-square group bg-white shadow-sm`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${svc.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{svc.label}</span>
                                </button>
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}
