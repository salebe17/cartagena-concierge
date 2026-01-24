'use client'

import { useState } from 'react'
import { createServiceRequest } from '@/app/actions/dashboard'
import { X, Loader2, Calendar, FileText } from 'lucide-react'
import { useToast } from "@/hooks/use-toast";

export function RequestServiceModal({
    propertyId,
    propertyName,
    serviceType,
    triggerButton
}: {
    propertyId: string
    propertyName: string
    serviceType: 'cleaning' | 'maintenance' | 'concierge'
    triggerButton: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast();

    const titles = {
        cleaning: 'Programar Limpieza',
        maintenance: 'Reportar Mantenimiento',
        concierge: 'Solicitar Concierge'
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append('propertyId', propertyId)
        formData.append('serviceType', serviceType)

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

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="w-full h-full cursor-pointer">{triggerButton}</div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{titles[serviceType]}</h3>
                                <p className="text-xs text-gray-500">{propertyName}</p>
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
                                        placeholder={serviceType === 'cleaning' ? "Ej. Cambio de sábanas, limpieza profunda..." : "Ej. El aire acondicionado gotea..."}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-rose-100 h-24 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl font-bold text-white bg-[#FF5A5F] hover:bg-[#E03E43] shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Solicitud'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
