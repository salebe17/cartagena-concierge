"use client";

import { useActiveAccount } from "thirdweb/react";
import { Sparkles, Wrench, Shirt, Box, PlusCircle, Building } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserProperties } from "@/app/actions";
import { PropertyWizard } from "./property/PropertyWizard";

export function HostCatalog() {
    const account = useActiveAccount();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);

    const fetchProperties = async () => {
        try {
            const props = await getUserProperties();
            setProperties(props);
            // If no properties, show wizard automatically
            if (props.length === 0) setShowWizard(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (account) fetchProperties();
    }, [account]);

    if (loading) return <div className="text-center text-yellow-500 py-20 animate-pulse">Cargando tus propiedades...</div>;

    if (showWizard) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={() => setShowWizard(false)} className="text-gray-500 hover:text-white text-xs uppercase tracking-widest">
                        &larr; Volver
                    </button>
                    <h1 className="text-xl font-bold text-white">Registrar Nueva Propiedad</h1>
                </div>
                <PropertyWizard onComplete={() => { setShowWizard(false); fetchProperties(); }} />
            </div>
        )
    }

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
            {/* Header / Property Selector */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="inline-block px-4 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold tracking-widest uppercase mb-4">
                        Panel de Anfitrion
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Gestor</span>
                    </h2>
                    <p className="text-gray-400 mt-2">
                        Gestionando {properties.length} propiedad{properties.length !== 1 && 'es'}.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setShowWizard(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors border border-white/10"
                    >
                        <PlusCircle className="w-4 h-4 text-yellow-500" />
                        Agregar Propiedad
                    </button>
                </div>
            </div>

            {/* Properties List (Mini) */}
            {properties.length > 0 && (
                <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {properties.map(p => (
                        <div key={p.id} className="bg-gray-900/40 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-gray-800 rounded-lg">
                                <Building className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">{p.title}</h4>
                                <p className="text-gray-500 text-xs truncate max-w-[150px]">{p.address}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <h3 className="text-xl font-bold text-white mb-6">Solicitar Servicio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
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
