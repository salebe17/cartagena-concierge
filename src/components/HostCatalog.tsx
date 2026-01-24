"use client";

import { useActiveAccount } from "thirdweb/react";
import { Sparkles, Wrench, Shirt, Box, PlusCircle, Building, Search, User, LogOut, CalendarDays, Key, ShoppingCart, Armchair } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserProperties, createServiceOrder } from "@/app/actions";
import { PropertyWizard } from "./property/PropertyWizard";
import { PropertyCalendar } from "./dashboard/PropertyCalendar";
import { HostProfile } from "./dashboard/HostProfile";

// Cleaning Modal (Enhanced)
function CleaningModal({ amount, breakdown, onClose, propertyName, onConfirm }: any) {
    if (!amount) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="text-center">
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Limpieza Tipo Hotel</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{propertyName}</p>
                </div>

                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 space-y-2">
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-2">⭐ Incluye Pack Premium:</p>
                    <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Insumos (Jabón, Papel, Bolsas)</li>
                        <li>Reporte Fotográfico (Estado Inicial/Final)</li>
                        <li>Chequeo de Inventario & Daños</li>
                        <li>Aromaterapia de Bienvenida</li>
                    </ul>
                </div>

                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Tarifa Base</span>
                        <span>${breakdown.base.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Habitaciones</span>
                        <span>+ ${breakdown.bedrooms.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Baños</span>
                        <span>+ ${breakdown.bathrooms.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-rose-500">${amount.toLocaleString()} COP</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs uppercase transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm()}
                        className="px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase transition-colors shadow-lg shadow-rose-500/30"
                    >
                        Agendar
                    </button>
                </div>
            </div>
        </div>
    )
}

// Maintenance Modal (Light)
function MaintenanceModal({ onClose, onSubmit, isSubmitting }: any) {
    const [details, setDetails] = useState({ description: "", category: "Aire Acondicionado", urgency: "Normal" });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Wrench className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Solicitud de Mantenimiento</h3>
                    <p className="text-sm text-gray-500">Diagnóstico técnico especializado</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-gray-400 mb-2 block">Categoría</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:border-blue-500 outline-none"
                            value={details.category}
                            onChange={(e) => setDetails({ ...details, category: e.target.value })}
                        >
                            <option value="Aire Acondicionado">Aire Acondicionado</option>
                            <option value="Cerrajería">Cerrajería (Tradicional/Electrónica)</option>
                            <option value="Electrodomésticos">Electrodomésticos (TV/Nevera/Estufa)</option>
                            <option value="Piscinas">Piscinas & Jacuzzis</option>
                            <option value="Redes">Redes (Eléctrica/Hidráulica)</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-gray-400 mb-2 block">Detalle del Problema</label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:border-blue-500 outline-none h-24 resize-none placeholder:text-gray-400"
                            placeholder="Describe el daño o requerimiento..."
                            value={details.description}
                            onChange={(e) => setDetails({ ...details, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-gray-400 mb-2 block">Prioridad</label>
                        <div className="flex gap-2">
                            {['Normal', 'Alta', 'Emergencia'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setDetails({ ...details, urgency: p })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all
                                        ${details.urgency === p
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={onClose} disabled={isSubmitting} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs uppercase transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSubmit(details)}
                        disabled={!details.description || isSubmitting}
                        className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/30"
                    >
                        {isSubmitting ? "Enviando..." : "Solicitar Visita"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Laundry Modal (Light)
function LaundryModal({ onClose, onSubmit, isSubmitting }: any) {
    const [bags, setBags] = useState(1);
    const PRICE_PER_BAG = 35000;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="text-center">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Shirt className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Lavandería Express</h3>
                    <p className="text-sm text-gray-500">Recogida, lavado, secado y doblado</p>
                </div>

                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-center gap-6">
                        <button onClick={() => setBags(Math.max(1, bags - 1))} className="w-12 h-12 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-xl hover:bg-gray-50">-</button>
                        <div className="text-center">
                            <span className="text-5xl font-bold text-gray-900">{bags}</span>
                            <p className="text-xs text-gray-400 uppercase font-bold mt-2">Bolsas (Aprox 5kg)</p>
                        </div>
                        <button onClick={() => setBags(bags + 1)} className="w-12 h-12 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-xl hover:bg-gray-50">+</button>
                    </div>

                    <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Estimado</p>
                        <p className="text-3xl font-bold text-gray-900">${(bags * PRICE_PER_BAG).toLocaleString()} <span className="text-sm font-normal text-gray-500">COP</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} disabled={isSubmitting} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs uppercase transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSubmit({ bags })}
                        disabled={isSubmitting}
                        className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/30"
                    >
                        {isSubmitting ? "Enviando..." : "Solicitar"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Furniture Wash Modal
function FurnitureModal({ onClose, onSubmit, isSubmitting }: any) {
    const [details, setDetails] = useState({ type: "Sofá 2 Puestos", quantity: 1 });

    const TYPES = [
        { label: "Sofá (por puesto)", price: 35000 },
        { label: "Colchón Sencillo", price: 60000 },
        { label: "Colchón Doble+", price: 90000 },
        { label: "Silla Comedor", price: 15000 },
        { label: "Alfombra (m2)", price: 12000 },
    ];

    const price = TYPES.find(t => t.label === details.type)?.price || 0;
    const total = price * details.quantity;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="text-center">
                    <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Box className="w-6 h-6 text-cyan-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Lavado de Muebles</h3>
                    <p className="text-sm text-gray-500">Inyección y Succión Profunda</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-gray-400 mb-2 block">Tipo de Mueble</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none"
                            value={details.type}
                            onChange={(e) => setDetails({ ...details, type: e.target.value })}
                        >
                            {TYPES.map(t => <option key={t.label} value={t.label}>{t.label} - ${t.price.toLocaleString()}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-gray-400 mb-2 block">Cantidad</label>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setDetails(d => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))} className="w-10 h-10 border rounded-lg text-lg font-bold hover:bg-gray-50 text-gray-900">-</button>
                            <span className="flex-1 text-center font-bold text-xl text-gray-900">{details.quantity}</span>
                            <button onClick={() => setDetails(d => ({ ...d, quantity: d.quantity + 1 }))} className="w-10 h-10 border rounded-lg text-lg font-bold hover:bg-gray-50 text-gray-900">+</button>
                        </div>
                    </div>
                    <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Estimado</p>
                        <p className="text-3xl font-bold text-gray-900">${total.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} disabled={isSubmitting} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs uppercase transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSubmit({ ...details, total })}
                        disabled={isSubmitting}
                        className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase transition-colors disabled:opacity-50 shadow-lg shadow-cyan-500/30"
                    >
                        Solicitar
                    </button>
                </div>
            </div>
        </div>
    )
}

// Grocery Modal
function GroceryModal({ onClose, onSubmit, isSubmitting }: any) {
    const [list, setList] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Mercado & Insumos</h3>
                    <p className="text-sm text-gray-500">Enviamos lo que necesites</p>
                </div>

                <div>
                    <label className="text-xs uppercase font-bold text-gray-400 mb-2 block">Lista de Compras</label>
                    <textarea
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 h-32 resize-none placeholder:text-gray-400 outline-none focus:border-emerald-500"
                        placeholder="Ej: 2 Papel Higiénico, 1 Jabón Loza, 6 Cervezas..."
                        value={list}
                        onChange={(e) => setList(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 text-center">Cobramos el valor del ticket + $15.000 Domicilio</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} disabled={isSubmitting} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs uppercase transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSubmit({ list })}
                        disabled={!list || isSubmitting}
                        className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/30"
                    >
                        Enviar Lista
                    </button>
                </div>
            </div>
        </div>
    )
}

// Inspection Modal (Empty House)
function InspectionModal({ onClose, onSubmit, isSubmitting }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="text-center">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Key className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Visita Técnica</h3>
                    <p className="text-sm text-gray-500">Para propiedades vacías</p>
                </div>

                <div className="text-sm text-gray-600 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p>Realizamos una visita completa que incluye:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Ventilación de espacios</li>
                        <li>Encendido de aires y electrodomésticos</li>
                        <li>Descarga de inodoros y grifos</li>
                        <li>Encendido de vehículo (si aplica)</li>
                        <li>Reporte de novedades</li>
                    </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} disabled={isSubmitting} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs uppercase transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSubmit({ type: 'Empty House Inspection' })} // Fixed price usually
                        disabled={isSubmitting}
                        className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/30"
                    >
                        Solicitar ($40k)
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // View State
    const [activeTab, setActiveTab] = useState<'services' | 'calendar' | 'profile'>('services');

    // Quote State
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [quote, setQuote] = useState<any>(null);
    const [quoting, setQuoting] = useState(false);

    // Active Service State
    const [activeService, setActiveService] = useState<'cleaning' | 'maintenance' | 'laundry' | 'furniture' | 'grocery' | 'inspection' | null>(null);

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
        if (!selectedPropertyId) return alert("Selecciona una propiedad primero.");

        if (serviceTitle === "Aseo & Limpieza") {
            setQuoting(true);
            try {
                const { calculateCleaningQuote } = await import("@/app/actions");
                const result = await calculateCleaningQuote(selectedPropertyId);
                if ((result as any).error) return alert((result as any).error);
                setQuote(result);
                setActiveService('cleaning');
            } catch (e) { console.error(e) } finally { setQuoting(false) }
        }
        else if (serviceTitle === "Mantenimiento") {
            setActiveService('maintenance');
        }
        else if (serviceTitle === "Lavandería") {
            setActiveService('laundry');
        }
        else if (serviceTitle === "Lavado Muebles") {
            setActiveService('furniture');
        }
        else if (serviceTitle === "Mercado & Insumos") {
            setActiveService('grocery');
        }
        else if (serviceTitle === "Visita Técnica") {
            setActiveService('inspection');
        }
    }

    const handleCreateOrder = async (details: any) => {
        if (!selectedPropertyId || !activeService || !account?.address) return;

        setIsSubmitting(true);
        try {
            const result = await createServiceOrder(selectedPropertyId, activeService, details, account.address);

            if (result.success) {
                alert(`¡Orden Recibida!`);
                setActiveService(null);
                setQuote(null);
            } else {
                alert("Error: " + result.error);
            }
        } catch (e: any) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) return <div className="text-center text-gray-500 py-20 animate-pulse">Cargando tus propiedades...</div>;

    if (showWizard) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={() => setShowWizard(false)} className="text-gray-500 hover:text-gray-900 text-xs uppercase tracking-widest font-bold">
                        &larr; Volver
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Registrar Nueva Propiedad</h1>
                </div>
                <PropertyWizard onComplete={() => { setShowWizard(false); fetchProperties(); }} />
            </div>
        )
    }

    const services = [
        {
            icon: Sparkles,
            title: "Aseo & Limpieza",
            description: "Limpieza hotelera, insumos incluidos, fotos de inventario.",
            color: "text-rose-500",
            bg: "bg-rose-50",
            border: "hover:border-rose-200"
        },
        {
            icon: Wrench,
            title: "Mantenimiento",
            description: "Aires, Estufas, Piscinas, Cerrajería y Redes.",
            color: "text-blue-500",
            bg: "bg-blue-50",
            border: "hover:border-blue-200"
        },
        {
            icon: Shirt,
            title: "Lavandería",
            description: "Lavado de lencería, toallas, ropa de cama.",
            color: "text-indigo-500",
            bg: "bg-indigo-50",
            border: "hover:border-indigo-200"
        },
        {
            icon: Armchair,
            title: "Lavado Muebles",
            description: "Limpieza profunda de sofás, colchones y alfombras.",
            color: "text-cyan-500",
            bg: "bg-cyan-50",
            border: "hover:border-cyan-200"
        },
        {
            icon: ShoppingCart,
            title: "Mercado & Insumos",
            description: "Restocking de papel, jabón y víveres a domicilio.",
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            border: "hover:border-emerald-200"
        },
        {
            icon: Key,
            title: "Visita Técnica",
            description: "Inspección de casas vacías, ventilación y encendido.",
            color: "text-amber-500",
            bg: "bg-amber-50",
            border: "hover:border-amber-200"
        }
    ];

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);

    return (
        <div className="animate-in fade-in zoom-in duration-500 relative min-h-screen bg-white">
            {/* Modals */}
            {activeService === 'cleaning' && quote && (
                <CleaningModal
                    amount={quote.total}
                    breakdown={quote.breakdown}
                    propertyName={selectedProperty?.title}
                    onClose={() => { setQuote(null); setActiveService(null); }}
                    onConfirm={() => handleCreateOrder({})}
                />
            )}

            {activeService === 'maintenance' && (
                <MaintenanceModal
                    onClose={() => setActiveService(null)}
                    onSubmit={handleCreateOrder}
                    isSubmitting={isSubmitting}
                />
            )}

            {activeService === 'laundry' && (
                <LaundryModal
                    onClose={() => setActiveService(null)}
                    onSubmit={handleCreateOrder}
                    isSubmitting={isSubmitting}
                />
            )}

            {activeService === 'furniture' && (
                <FurnitureModal
                    onClose={() => setActiveService(null)}
                    onSubmit={handleCreateOrder}
                    isSubmitting={isSubmitting}
                />
            )}

            {activeService === 'grocery' && (
                <GroceryModal
                    onClose={() => setActiveService(null)}
                    onSubmit={handleCreateOrder}
                    isSubmitting={isSubmitting}
                />
            )}

            {activeService === 'inspection' && (
                <InspectionModal
                    onClose={() => setActiveService(null)}
                    onSubmit={handleCreateOrder}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 border-b border-gray-100 pb-8 bg-white sticky top-0 z-40 py-6">
                <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-3">
                        Panel de Anfitrion
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        <span className="text-rose-500">Concierge</span> Dashboard
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Bienvenido, gestiona tus {properties.length} propiedad{properties.length !== 1 && 'es'}.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setShowWizard(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-gray-200 transform hover:-translate-y-0.5"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Nueva Propiedad
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
                                    ? 'bg-white border-rose-500 ring-2 ring-rose-500/10 shadow-lg'
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}
                            `}
                        >
                            <div className={`p-3 rounded-lg ${selectedPropertyId === p.id ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-500'}`}>
                                <Building className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold ${selectedPropertyId === p.id ? 'text-gray-900' : 'text-gray-600'}`}>{p.title}</h4>
                                <p className="text-gray-400 text-xs truncate max-w-[150px]">{p.address}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TABS */}
            <div className="flex gap-8 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 
                        ${activeTab === 'services' ? 'text-rose-500 border-rose-500' : 'text-gray-400 border-transparent hover:text-gray-900'}
                    `}
                >
                    Servicios
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 
                        ${activeTab === 'calendar' ? 'text-rose-500 border-rose-500' : 'text-gray-400 border-transparent hover:text-gray-900'}
                    `}
                >
                    Calendario
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 
                        ${activeTab === 'profile' ? 'text-rose-500 border-rose-500' : 'text-gray-400 border-transparent hover:text-gray-900'}
                    `}
                >
                    Perfil
                </button>
            </div>

            {/* VIEW CONTENT */}
            {activeTab === 'services' ? (
                <>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        Solicitar Servicio {quoting && <span className="text-xs text-rose-500 animate-pulse ml-2 font-normal bg-rose-50 px-2 py-0.5 rounded-full">Cotizando...</span>}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleServiceClick(service.title)}
                                className={`group bg-white border border-gray-100 hover:border-gray-200 p-6 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-4 rounded-2xl ${service.bg} ${service.color} group-hover:scale-110 transition-transform`}>
                                        <service.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{service.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : activeTab === 'calendar' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {selectedPropertyId ? (
                        <PropertyCalendar propertyId={selectedPropertyId} />
                    ) : (
                        <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Selecciona una propiedad arriba para ver su calendario.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex justify-center pt-8">
                    <HostProfile />
                </div>
            )}
        </div>
    );
}
