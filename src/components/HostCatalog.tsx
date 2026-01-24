"use client";

import { useActiveAccount } from "thirdweb/react";
import { Sparkles, Wrench, Shirt, Box, PlusCircle, Building, Search, User, LogOut, CalendarDays, Key, ShoppingCart, Armchair, CheckCircle2, Star, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserProperties, createServiceOrder } from "@/app/actions";
import { PropertyWizard } from "./property/PropertyWizard";
import { PropertyCalendar } from "./dashboard/PropertyCalendar";
import { HostProfile } from "./dashboard/HostProfile";
import { motion, AnimatePresence } from "framer-motion";

// Unified Service Wizard
interface WizardStepProps {
    title: string;
    subtitle?: string;
    icon: any;
    iconColor: string;
    iconBg: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

function WizardStep({ title, subtitle, icon: Icon, iconColor, iconBg, onClose, children, footer }: WizardStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-[32px] w-full max-w-md p-8 space-y-8 shadow-airbnb border border-white/40"
        >
            <div className="text-center relative">
                <button onClick={onClose} className="absolute -top-4 -right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentColor', strokeWidth: 3, overflow: 'visible' }}><path d="m6 6 20 20M26 6 6 26"></path></svg>
                </button>
                <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner`}>
                    <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>

            <div className="min-h-[200px] flex flex-col justify-center">
                {children}
            </div>

            {footer && (
                <div className="pt-4">
                    {footer}
                </div>
            )}
        </motion.div>
    );
}



// Maintenance Wizard Content
function MaintenanceWizardContent({ onClose, onSubmit, isSubmitting }: any) {
    const [step, setStep] = useState(1);
    const [details, setDetails] = useState({ description: "", category: "Aire Acondicionado", urgency: "Normal" });

    if (step === 1) {
        return (
            <WizardStep
                title="Soporte Técnico"
                subtitle="Mano de Obra Certificada"
                icon={Wrench}
                iconColor="text-blue-500"
                iconBg="bg-blue-50"
                onClose={onClose}
                footer={
                    <button
                        onClick={() => setStep(2)}
                        disabled={!details.description}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        Siguiente: Revisar
                    </button>
                }
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Especialidad</label>
                        <select
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-sm text-gray-900 focus:border-blue-500 outline-none transition-all"
                            value={details.category}
                            onChange={(e) => setDetails({ ...details, category: e.target.value })}
                        >
                            <option value="Aire Acondicionado">Aire Acondicionado</option>
                            <option value="Cerrajería">Cerrajería</option>
                            <option value="Electrodomésticos">Electrodomésticos</option>
                            <option value="Piscinas">Piscinas & Jacuzzis</option>
                            <option value="Redes">Eléctrica/Hidráulica</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Detalle del Reporte</label>
                        <textarea
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-sm text-gray-900 focus:border-blue-500 outline-none h-28 resize-none placeholder:text-gray-300 transition-all font-sans"
                            placeholder="Describe el daño..."
                            value={details.description}
                            onChange={(e) => setDetails({ ...details, description: e.target.value })}
                        />
                    </div>
                </div>
            </WizardStep>
        );
    }

    return (
        <WizardStep
            title="Revisar Solicitud"
            subtitle="Paso final"
            icon={Wrench}
            iconColor="text-blue-500"
            iconBg="bg-blue-50"
            onClose={onClose}
            footer={
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onSubmit(details)}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl"
                    >
                        {isSubmitting ? "Enviando..." : "Confirmar Visita"}
                    </button>
                    <button onClick={() => setStep(1)} className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">Atrás</button>
                </div>
            }
        >
            <div className="space-y-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-medium">Categoría</span>
                    <span className="text-sm font-bold text-gray-900">{details.category}</span>
                </div>
                <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reporte</span>
                    <p className="text-sm text-gray-700 mt-1 italic">"{details.description}"</p>
                </div>
                <div className="h-px bg-blue-200/30 my-2"></div>
                <div className="flex justify-between items-end">
                    <span className="text-sm text-gray-500 font-medium font-bold">Costo Base</span>
                    <span className="text-2xl font-black text-gray-900">$50.000 <span className="text-[10px] text-gray-400 font-black">COP</span></span>
                </div>
            </div>
        </WizardStep>
    );
}

// Furniture Wizard Content
function FurnitureWizardContent({ onClose, onSubmit, isSubmitting }: any) {
    const [details, setDetails] = useState({ type: "Sofá (por puesto)", quantity: 1 });
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
        <WizardStep
            title="Lavado Profundo"
            subtitle="Inyección & Succión Industrial"
            icon={Box}
            iconColor="text-cyan-500"
            iconBg="bg-cyan-50"
            onClose={onClose}
            footer={
                <button
                    onClick={() => onSubmit({ ...details, total })}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                    {isSubmitting ? "Solicitando..." : "Confirmar Servicio"}
                </button>
            }
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Mueble</label>
                    <select
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-sm text-gray-900 outline-none focus:border-cyan-500 transition-all"
                        value={details.type}
                        onChange={(e) => setDetails({ ...details, type: e.target.value })}
                    >
                        {TYPES.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cantidad / Unidades</label>
                    <div className="flex items-center gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <button onClick={() => setDetails(d => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xl hover:bg-white">-</button>
                        <span className="flex-1 text-center font-bold text-xl text-gray-900">{details.quantity}</span>
                        <button onClick={() => setDetails(d => ({ ...d, quantity: d.quantity + 1 }))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center font-bold text-xl hover:bg-white">+</button>
                    </div>
                </div>

                <div className="text-center pt-2 bg-cyan-50/50 p-4 rounded-xl">
                    <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Estimado</p>
                    <p className="text-4xl font-black text-cyan-900">${total.toLocaleString()} <span className="text-sm font-bold opacity-30">COP</span></p>
                </div>
            </div>
        </WizardStep>
    );
}

// Grocery Wizard Content
function GroceryWizardContent({ onClose, onSubmit, isSubmitting }: any) {
    const [list, setList] = useState("");

    return (
        <WizardStep
            title="Mercado & Insumos"
            subtitle="Restock Inmediato"
            icon={ShoppingCart}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50"
            onClose={onClose}
            footer={
                <button
                    onClick={() => onSubmit({ list })}
                    disabled={!list || isSubmitting}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                    {isSubmitting ? "Enviando..." : "Confirmar Pedido"}
                </button>
            }
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Lista de Requerimientos</label>
                    <textarea
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-sm text-gray-900 h-36 resize-none placeholder:text-gray-300 outline-none focus:border-emerald-500 transition-all font-sans"
                        placeholder="Ej: 2 Papel Higiénico, 1 Jabón Loza, 6 Cervezas..."
                        value={list}
                        onChange={(e) => setList(e.target.value)}
                    />
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest text-center mb-1">Tarifa de Domicilio</p>
                    <p className="text-2xl font-black text-emerald-900 text-center">$15.000 <span className="text-xs opacity-40">COP</span></p>
                    <p className="text-[9px] text-gray-400 mt-2 text-center">* Valor de productos se paga contra entrega con ticket físico.</p>
                </div>
            </div>
        </WizardStep>
    );
}

// Inspection Wizard Content
function InspectionWizardContent({ onClose, onSubmit, isSubmitting }: any) {
    return (
        <WizardStep
            title="Visita Técnica"
            subtitle="Control de Propiedad"
            icon={Key}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
            onClose={onClose}
            footer={
                <button
                    onClick={() => onSubmit({ type: 'Empty House Inspection' })}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                    {isSubmitting ? "Agendando..." : "Confirmar Visita"}
                </button>
            }
        >
            <div className="space-y-6">
                <div className="text-xs text-gray-600 space-y-3 bg-white p-6 rounded-2xl border border-gray-100 leading-relaxed shadow-sm">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-amber-500" />
                        <span className="font-medium">Ventilación y Control de Humedad</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-amber-500" />
                        <span className="font-medium">Encendido de Aires y Grifos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-amber-500" />
                        <span className="font-medium">Reporte Fotográfico de Estado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-amber-500" />
                        <span className="font-medium">Verificación de Cierres y Alarmas</span>
                    </div>
                </div>

                <div className="text-center bg-amber-50/80 p-4 rounded-xl border border-amber-100">
                    <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest mb-1">Costo por Visita</p>
                    <p className="text-4xl font-black text-amber-900">$40.000 <span className="text-sm font-bold opacity-30">COP</span></p>
                </div>
            </div>
        </WizardStep>
    );
}

// Laundry Wizard Content
function LaundryWizardContent({ onClose, onSubmit, isSubmitting }: any) {
    const [bags, setBags] = useState(1);
    const PRICE_PER_BAG = 35000;

    return (
        <WizardStep
            title="Lavandería Express"
            subtitle="Recogida & Entrega 24h"
            icon={Shirt}
            iconColor="text-indigo-500"
            iconBg="bg-indigo-50"
            onClose={onClose}
            footer={
                <button
                    onClick={() => onSubmit({ bags })}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                    {isSubmitting ? "Enviando..." : "Confirmar Pedido"}
                </button>
            }
        >
            <div className="py-2">
                <div className="flex items-center justify-center gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <button onClick={() => setBags(Math.max(1, bags - 1))} className="w-12 h-12 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-2xl hover:bg-white transition-all">-</button>
                    <div className="text-center">
                        <span className="text-5xl font-black text-gray-900">{bags}</span>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mt-2 tracking-widest">Bolsas</p>
                    </div>
                    <button onClick={() => setBags(bags + 1)} className="w-12 h-12 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-2xl hover:bg-white transition-all">+</button>
                </div>

                <div className="mt-8 text-center bg-indigo-50/50 p-4 rounded-xl">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Estimado</p>
                    <p className="text-4xl font-black text-indigo-900">${(bags * PRICE_PER_BAG).toLocaleString()} <span className="text-sm font-bold opacity-30">COP</span></p>
                </div>
            </div>
        </WizardStep>
    );
}

// End of Modals

export function HostCatalog() {
    const account = useActiveAccount();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // View State
    const [activeTab, setActiveTab] = useState<'services' | 'calendar' | 'profile'>('services');

    // Quote State
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [quote, setQuote] = useState<any>(null);
    const [quoting, setQuoting] = useState(false);

    // Active Service State
    const [activeService, setActiveService] = useState<'cleaning' | 'maintenance' | 'laundry' | 'furniture' | 'grocery' | 'inspection' | null>(null);

    const fetchProperties = async () => {
        // Try Session First (Email Login)
        try {
            const { getUserPropertiesBySession } = await import("@/app/actions");
            const sessionProps = await getUserPropertiesBySession();

            if (sessionProps && sessionProps.length > 0) {
                setProperties(sessionProps);
                setSelectedPropertyId(sessionProps[0].id);
                setLoading(false);
                return;
            }
        } catch (e) { console.error("Session Fetch Error", e); }

        // Fallback to Wallet
        if (!account?.address) {
            // If no wallet and no session properties led to here, stop loading to show Empty State or Wizard
            setLoading(false);
            if (properties.length === 0) setShowWizard(true);
            return;
        }

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

    const fetchAlerts = async () => {
        if (!account?.address) return;
        try {
            const { getUserAlerts } = await import("@/app/actions");
            const data = await getUserAlerts(account.address);
            setAlerts(data);
        } catch (e) { console.error(e) }
    };

    useEffect(() => {
        // Run on mount to check session, and whenever account changes
        fetchProperties();
        fetchAlerts();
    }, [account]);

    const handleSync = async () => {
        if (!selectedPropertyId) return;
        setIsSyncing(true);
        try {
            const { syncPropertyCalendar } = await import("@/app/actions");
            const res = await syncPropertyCalendar(selectedPropertyId);
            if ((res as any).error) alert((res as any).error);
            else alert(`Sincronización exitosa: ${res.new} nuevas reservas.`);
            fetchAlerts();
        } catch (e) { console.error(e) } finally { setIsSyncing(false) }
    };

    const handleDismissAlert = async (id: string) => {
        try {
            const { markAlertAsRead } = await import("@/app/actions");
            await markAlertAsRead(id);
            fetchAlerts();
        } catch (e) { console.error(e) }
    };

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
            {/* Service Wizard Integration */}
            <AnimatePresence>
                {activeService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
                        {activeService === 'cleaning' && quote && (
                            <WizardStep
                                title="Limpieza Extra"
                                subtitle={selectedProperty?.title}
                                icon={Sparkles}
                                iconColor="text-rose-500"
                                iconBg="bg-rose-50"
                                onClose={() => { setQuote(null); setActiveService(null); }}
                                footer={
                                    <button
                                        onClick={() => handleCreateOrder({})}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-[var(--airbnb-red)] hover:bg-[var(--airbnb-red-dark)] text-white font-bold rounded-2xl transition-all shadow-hero transform active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Procesando..." : "Confirmar Reserva"}
                                    </button>
                                }
                            >
                                <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 font-medium">Tarifa Base</span>
                                        <span className="text-sm font-bold text-gray-900">${quote.breakdown.base.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 font-medium">Habitaciones</span>
                                        <span className="text-sm font-bold text-gray-900">+ ${quote.breakdown.bedrooms.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-600">
                                        <span className="text-sm font-bold">Insumos Hotel</span>
                                        <span className="text-xs font-black uppercase">Gratis</span>
                                    </div>
                                    <div className="h-px bg-gray-200/50 my-2"></div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Est.</span>
                                            <span className="text-4xl font-black text-gray-900">${quote.total.toLocaleString()}</span>
                                        </div>
                                        <span className="text-xs font-black text-gray-400 pb-1.5 uppercase">COP</span>
                                    </div>
                                </div>
                            </WizardStep>
                        )}

                        {activeService === 'maintenance' && (
                            <MaintenanceWizardContent
                                isSubmitting={isSubmitting}
                                onClose={() => setActiveService(null)}
                                onSubmit={handleCreateOrder}
                            />
                        )}

                        {activeService === 'laundry' && (
                            <LaundryWizardContent
                                isSubmitting={isSubmitting}
                                onClose={() => setActiveService(null)}
                                onSubmit={handleCreateOrder}
                            />
                        )}

                        {activeService === 'furniture' && (
                            <FurnitureWizardContent
                                isSubmitting={isSubmitting}
                                onClose={() => setActiveService(null)}
                                onSubmit={handleCreateOrder}
                            />
                        )}

                        {activeService === 'grocery' && (
                            <GroceryWizardContent
                                isSubmitting={isSubmitting}
                                onClose={() => setActiveService(null)}
                                onSubmit={handleCreateOrder}
                            />
                        )}

                        {activeService === 'inspection' && (
                            <InspectionWizardContent
                                isSubmitting={isSubmitting}
                                onClose={() => setActiveService(null)}
                                onSubmit={handleCreateOrder}
                            />
                        )}
                    </div>
                )}
            </AnimatePresence>

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
                    {selectedPropertyId && selectedProperty?.ical_url && (
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-all
                                ${isSyncing ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 shadow-sm'}
                            `}
                        >
                            <Globe className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? "Sincronizando..." : "Sincronizar Calendar"}
                        </button>
                    )}
                </div>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="mb-10 space-y-4 animate-in slide-in-from-left-4 duration-500">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2">
                        <Star className="w-3 h-3 fill-rose-500" />
                        Alertas de Operación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {alerts.map((alert: any) => (
                            <div key={alert.id} className="glass p-5 rounded-2xl border-rose-100 flex items-start gap-4 relative group">
                                <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-black text-gray-900">{alert.title}</h4>
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{alert.properties?.title}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{alert.message}</p>
                                    <button
                                        onClick={() => handleDismissAlert(alert.id)}
                                        className="mt-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors"
                                    >
                                        Marcar como leído
                                    </button>
                                </div>
                                <div className="absolute top-4 right-4 text-rose-500 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
