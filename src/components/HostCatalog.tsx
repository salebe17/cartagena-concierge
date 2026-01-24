"use client";

import { useActiveAccount } from "thirdweb/react";
import { Sparkles, Wrench, Shirt, Box } from "lucide-react";

export function HostCatalog() {
    const account = useActiveAccount();

    const services = [
        {
            icon: Sparkles,
            title: "Aseo & Limpieza",
            description: "Limpieza profunda, express y preparación para huéspedes.",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "hover:border-blue-500/50"
        },
        {
            icon: Wrench,
            title: "Mantenimiento",
            description: "Reparaciones urgentes: Aire acondicionado, plomería y electricidad.",
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "hover:border-orange-500/50"
        },
        {
            icon: Shirt,
            title: "Lavandería",
            description: "Recogida y entrega de lencería limpia en 24 horas.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "hover:border-purple-500/50"
        },
        {
            icon: Box,
            title: "Insumos",
            description: "Restocking de papel, jabón y amenidades de bienvenida.",
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "hover:border-green-500/50"
        }
    ];

    return (
        <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-12">
                <div className="inline-block px-4 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold tracking-widest uppercase mb-4">
                    Bienvenido al Club
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                    Catálogo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Anfitriones</span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Todo lo que tu propiedad necesita para mantener 5 estrellas, a un clic de distancia.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {services.map((service, idx) => (
                    <div
                        key={idx}
                        className={`group bg-gray-900/50 hover:bg-gray-900 border border-white/5 ${service.border} p-6 rounded-2xl transition-all duration-300 cursor-pointer`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${service.bg} ${service.color} group-hover:scale-110 transition-transform`}>
                                <service.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                                <p className="text-gray-400 text-sm">{service.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
