"use client";

import { useActiveAccount } from "thirdweb/react";
import { Sparkles, Wrench, Shirt, Box, PlusCircle, Building } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserProperties } from "@/app/actions";
import { PropertyWizard } from "./property/PropertyWizard";
import { PropertyCalendar } from "./dashboard/PropertyCalendar";

function QuoteModal({ amount, breakdown, onClose, propertyName }: any) {
    if (!amount) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Cotización de Limpieza</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{propertyName}</p>
                </div>

                <div className="space-y-3 bg-white/5 p-4 rounded-xl">
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Tarifa Base</span>
                        <span>${breakdown.base.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Habitaciones</span>
                        <span>+ ${breakdown.bedrooms.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Baños</span>
                        <span>+ ${breakdown.bathrooms.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2"></div>
                    <div className="flex justify-between text-lg font-bold text-white">
                        <span>Total</span>
                        <span className="text-green-400">${amount.toLocaleString()} COP</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase transition-colors">
                        Cancelar
                    </button>
                    <button className="px-4 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-xs uppercase transition-colors">
                        Agendar
                    </button>
                </div>
            </div>
        </div>
    )
}

export function HostCatalog() {
    const account = useActiveAccount();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);

    // View State
    const [activeTab, setActiveTab] = useState<'services' | 'calendar'>('services');

    // Quote State
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [quote, setQuote] = useState<any>(null);
    const [quoting, setQuoting] = useState(false);

    const fetchProperties = async () => {
        if (!account?.address) return;
        try {
            const props = await getUserProperties(account.address);
            setProperties(props);
            if (props.length === 0) setShowWizard(true);
            if (props.length > 0) setSelectedPropertyId(props[0].id);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (account) fetchProperties();
    }, [account]);

    const handleServiceClick = async (serviceTitle: string) => {
        if (serviceTitle !== "Aseo & Limpieza" || !selectedPropertyId) return;

        setQuoting(true);
        try {
            // Dynamic import to avoid SSR issues
            const { calculateCleaningQuote } = await import("@/app/actions");
            const result = await calculateCleaningQuote(selectedPropertyId);

            if ((result as any).error) return alert((result as any).error);

            setQuote(result);
        } catch (e) {
            console.error(e);
        } finally {
            setQuoting(false);
        }
    }

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

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);

    return (
        <div className="animate-in fade-in zoom-in duration-500 relative">
            {quote && (
                <QuoteModal
                    amount={quote.total}
                    breakdown={quote.breakdown}
                    propertyName={selectedProperty?.title}
                    onClose={() => setQuote(null)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 border-b border-white/5 pb-8">
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

            {/* Property Selector */}
            {properties.length > 0 && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {properties.map(p => (
                        <div
                            key={p.id}
                            onClick={() => setSelectedPropertyId(p.id)}
                            className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all border
                                ${selectedPropertyId === p.id
                                    ? 'bg-yellow-500/10 border-yellow-500/50 ring-1 ring-yellow-500/50'
                                    : 'bg-gray-900/40 border-white/5 hover:border-white/20'}
                            `}
                        >
                            <div className={`p-3 rounded-lg ${selectedPropertyId === p.id ? 'bg-yellow-500 text-black' : 'bg-gray-800'}`}>
                                <Building className={`w-5 h-5 ${selectedPropertyId === p.id ? 'text-black' : 'text-gray-400'}`} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">{p.title}</h4>
                                <p className="text-gray-500 text-xs truncate max-w-[150px]">{p.address}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TABS */}
            <div className="flex gap-6 mb-8 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 
                        ${activeTab === 'services' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent hover:text-white'}
                    `}
                >
                    Servicios
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 
                        ${activeTab === 'calendar' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent hover:text-white'}
                    `}
                >
                    Calendario & Disponibilidad
                </button>
            </div>

            {/* VIEW CONTENT */}
            {activeTab === 'services' ? (
                <>
                    <h3 className="text-xl font-bold text-white mb-6">Solicitar Servicio {quoting && <span className="text-xs text-yellow-500 animate-pulse ml-2">Cotizando...</span>}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleServiceClick(service.title)}
                                className={`group bg-gray-900/50 hover:bg-gray-900 border border-white/5 ${service.border} p-6 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden`}
                            >
                                {service.title !== "Aseo & Limpieza" && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10">
                                        <span className="text-xs uppercase font-bold tracking-widest text-gray-300">Próximamente</span>
                                    </div>
                                )}

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
                </>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {selectedPropertyId ? (
                        <PropertyCalendar propertyId={selectedPropertyId} />
                    ) : (
                        <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-white/5 border-dashed">
                            <p className="text-gray-400">Selecciona una propiedad arriba para ver su calendario.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
