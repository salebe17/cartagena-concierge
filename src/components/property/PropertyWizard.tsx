"use client";

import { useState } from "react";
import { User, MapPin, Home, Key, Wifi, CheckCircle } from "lucide-react";
import { createProperty } from "@/app/actions";
import { useActiveAccount } from "thirdweb/react";

const STEPS = [
    { id: 1, title: "Básico", icon: Home },
    { id: 2, title: "Ubicación", icon: MapPin },
    { id: 3, title: "Detalles", icon: CheckCircle },
    { id: 4, title: "Acceso", icon: Key }
];

export function PropertyWizard({ onComplete }: { onComplete: () => void }) {
    const account = useActiveAccount();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        title: "",
        property_type: "Apartment",
        max_guests: 2,
        address: "",
        bedrooms: 1,
        bathrooms: 1,
        wifi_network: "",
        wifi_password: "",
        access_instructions: ""
    });

    const handleChange = (field: string, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const submitForm = async () => {
        setLoading(true);
        try {
            const result = await createProperty(data, account?.address || "");

            if (result.success) {
                onComplete();
            } else {
                alert("Error creando propiedad: " + result.error);
            }
        } catch (e: any) {
            console.error(e);
            alert("Error al guardar. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else submitForm();
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            {/* Header Steps */}
            <div className="flex border-b border-gray-100 bg-gray-50">
                {STEPS.map((s, idx) => {
                    const active = s.id === step;
                    const completed = s.id < step;
                    return (
                        <div key={s.id} className={`flex-1 p-4 flex flex-col items-center justify-center border-r border-gray-100 last:border-0 relative
                            ${active ? 'text-rose-600 bg-rose-50/50' : completed ? 'text-gray-900' : 'text-gray-400'}
                        `}>
                            <s.icon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">{s.title}</span>
                            {active && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500"></div>}
                        </div>
                    );
                })}
            </div>

            {/* Content Body */}
            <div className="p-8 min-h-[400px]">

                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-gray-900">Información Básica</h2>
                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Nombre de la Propiedad</label>
                            <input
                                type="text"
                                placeholder="Ej: Casa Blanca Old City"
                                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 outline-none focus:border-rose-500 focus:bg-white transition-all"
                                value={data.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Tipo</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 outline-none focus:border-rose-500 focus:bg-white transition-all"
                                    value={data.property_type}
                                    onChange={(e) => handleChange("property_type", e.target.value)}
                                >
                                    <option value="Apartment">Apartamento</option>
                                    <option value="House">Casa</option>
                                    <option value="Villa">Villa de Lujo</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Huéspedes Máx</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 outline-none focus:border-rose-500 focus:bg-white transition-all"
                                    value={data.max_guests}
                                    onChange={(e) => handleChange("max_guests", parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: LOCATION */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-gray-900">Ubicación Exacta</h2>
                        <p className="text-gray-500 text-sm">Necesitamos la dirección exacta para coordinar la limpieza y entregas.</p>
                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Dirección Completa</label>
                            <textarea
                                placeholder="Calle, Número, Edificio, Apto..."
                                className="w-full h-32 bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 outline-none focus:border-rose-500 focus:bg-white transition-all resize-none"
                                value={data.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3: DETAILS */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-gray-900">Habitaciones & Baños</h2>
                        <p className="text-gray-500 text-sm">Los precios de limpieza se calculan automáticamente con esta info.</p>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Habitaciones", key: "bedrooms" },
                                { label: "Baños", key: "bathrooms" },
                                { label: "Camas Total", key: "beds" }
                            ].map((field) => (
                                <div key={field.key} className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
                                    <label className="text-[10px] uppercase text-gray-500 font-bold block mb-2">{field.label}</label>
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm"
                                            onClick={() => handleChange(field.key, Math.max(0, (data as any)[field.key] - 1))}
                                        >-</button>
                                        <span className="text-2xl font-bold text-gray-900">{(data as any)[field.key]}</span>
                                        <button
                                            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 shadow-sm"
                                            onClick={() => handleChange(field.key, (data as any)[field.key] + 1)}
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: AMENITIES / WIFI */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-gray-900">Datos de Acceso</h2>
                        <p className="text-gray-500 text-sm">Guarda estos datos para tu equipo y huéspedes.</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Red WiFi</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 outline-none focus:border-rose-500 focus:bg-white transition-all"
                                    value={data.wifi_network}
                                    onChange={(e) => handleChange("wifi_network", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Clave WiFi</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 outline-none focus:border-rose-500 focus:bg-white transition-all"
                                    value={data.wifi_password}
                                    onChange={(e) => handleChange("wifi_password", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Instrucciones de Acceso / Caja de Llaves</label>
                            <textarea
                                placeholder="Código de la puerta, ubicación de llaves, etc..."
                                className="w-full h-32 bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900 outline-none focus:border-rose-500 focus:bg-white transition-all resize-none"
                                value={data.access_instructions}
                                onChange={(e) => handleChange("access_instructions", e.target.value)}
                            />
                        </div>
                    </div>
                )}

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Atras
                    </button>
                )}

                <button
                    onClick={handleNext}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-sm tracking-wider uppercase transition-colors shadow-lg shadow-gray-900/10 disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                >
                    {loading ? "Guardando..." : step === 4 ? "Finalizar Registro" : "Continuar"}
                </button>
            </div>
        </div>
    );
}
