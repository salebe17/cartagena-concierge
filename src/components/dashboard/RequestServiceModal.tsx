'use client'

import { useState, useEffect } from 'react'
import { createServiceRequest } from '@/app/actions/dashboard'
import { X, Loader2, Calendar, FileText, Sparkles, Wrench, User, ChevronLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast";

export function RequestServiceModal({
    propertyId,
    propertyName,
    serviceType: initialServiceType,
    triggerButton
}: {
    propertyId: string
    propertyName: string
    serviceType?: 'cleaning' | 'maintenance' | 'concierge'
    triggerButton: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedType, setSelectedType] = useState<string | null>(initialServiceType || null)
    const { toast } = useToast();

    // Reset selection when opening if no initial type forced
    useEffect(() => {
        if (isOpen && !initialServiceType) {
            setSelectedType(null);
        }
    }, [isOpen, initialServiceType]);

    const titleMap: Record<string, string> = {
        cleaning: 'Programar Limpieza',
        maintenance: 'Reportar Mantenimiento',
        concierge: 'Solicitar Concierge'
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedType) return;

        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append('propertyId', propertyId)
        formData.append('serviceType', selectedType)

        const result = await createServiceRequest(formData)

        setIsLoading(false)
        if (result.success) {
            setIsOpen(false)
            toast({
                title: "✅ Solicitud enviada",
                description: "Tu concierge te contactará pronto para coordinar.",
            })
        } else {
            toast({
                title: "❌ Error",
                description: result.error || "No se pudo enviar la solicitud.",
                variant: "destructive"
            })
        }
    }

    const ServiceOption = ({ type, icon: Icon, label, colorClass, iconColor }: any) => (
        <button
            onClick={() => setSelectedType(type)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 hover:border-black transition-all group aspect-square ${colorClass}`}
        >
            <div className={`w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={24} className={iconColor} />
            </div>
            <span className="font-bold text-gray-900 leading-tight">{label}</span>
        </button>
    );

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="w-full h-full cursor-pointer">{triggerButton}</div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-2">
                                {!initialServiceType && selectedType && (
                                    <button onClick={() => setSelectedType(null)} className="mr-1 hover:bg-gray-200 p-1 rounded-full"><ChevronLeft size={20} /></button>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {selectedType ? titleMap[selectedType] : "Nueva Solicitud"}
                                    </h3>
                                    <p className="text-xs text-gray-500">{propertyName}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        {!selectedType ? (
                            // Selection Grid
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <ServiceOption
                                    type="cleaning"
                                    icon={Sparkles}
                                    label="Limpieza"
                                    colorClass="bg-teal-50 hover:bg-teal-100"
                                    iconColor="text-teal-600"
                                />
                                <ServiceOption
                                    type="maintenance"
                                    icon={Wrench}
                                    label="Mantenimiento"
                                    colorClass="bg-orange-50 hover:bg-orange-100"
                                    iconColor="text-orange-600"
                                />
                                <ServiceOption
                                    type="concierge"
                                    icon={User}
                                    label="Concierge"
                                    colorClass="bg-purple-50 hover:bg-purple-100"
                                    iconColor="text-purple-600"
                                />
                            </div>
                        ) : (
                            // Form
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Fecha y Hora Requerida</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="datetime-local"
                                            name="date"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-rose-100 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Notas Adicionales</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <textarea
                                            name="notes"
                                            placeholder={selectedType === 'cleaning' ? "Ej. Cambio de sábanas, limpieza profunda..." : "Ej. El aire acondicionado gotea..."}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-rose-100 h-24 resize-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-2">
                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-[#FF5A5F]">
                                        <span>Estimado de Cobro</span>
                                        {selectedType === 'cleaning' && <span>Base</span>}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl font-black text-gray-900">
                                            {selectedType === 'cleaning' ? '$40.000' :
                                                selectedType === 'maintenance' ? '$50.000' : '$15.000'}
                                            <span className="text-sm ml-1 text-gray-400">COP</span>
                                        </p>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter bg-white px-2 py-1 rounded-lg">
                                            Pago Automático
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-tight italic">
                                        {selectedType === 'cleaning' ? '* El cobro final depende del tamaño de la unidad.' :
                                            selectedType === 'maintenance' ? '* Cubre diagnóstico y primera hora de labor.' :
                                                '* Tarifa base por gestión de pedidos o compras.'}
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-xl font-bold text-white bg-[#FF5A5F] hover:bg-[#E03E43] shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Solicitud'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
