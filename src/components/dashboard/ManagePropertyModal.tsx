'use client'

import { useState } from 'react'
import { deleteProperty, updatePropertyStatus } from '@/app/actions/dashboard'
import { X, Trash2, Settings2, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast";

export function ManagePropertyModal({
    propertyId,
    propertyTitle,
    currentStatus,
    triggerButton
}: {
    propertyId: string
    propertyTitle: string
    currentStatus: string
    triggerButton: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [status, setStatus] = useState(currentStatus)
    const [isUpdating, setIsUpdating] = useState(false)
    const { toast } = useToast()

    // Manejar cambio de estado (Ocupado/Vacante)
    const handleStatusChange = async (newStatus: 'vacant' | 'occupied') => {
        if (newStatus === status) return;

        setIsUpdating(true)
        setStatus(newStatus) // Actualización optimista

        const result = await updatePropertyStatus(propertyId, newStatus)
        setIsUpdating(false)

        if (result.success) {
            toast({
                title: "Estado actualizado",
                description: `${propertyTitle} ahora está ${newStatus === 'occupied' ? 'Ocupado' : 'Disponible'}.`,
            })
        } else {
            setStatus(currentStatus) // Revertir si falla
            toast({
                title: "Error al actualizar",
                description: result.error,
                variant: "destructive"
            })
        }
    }

    // Manejar eliminación
    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad permanentemente? Esta acción no se puede deshacer.")) return;

        setIsDeleting(true)
        const result = await deleteProperty(propertyId)

        if (result.success) {
            setIsOpen(false)
            toast({
                title: "Propiedad eliminada",
                description: "La unidad ha sido removida de tu portafolio.",
            })
        } else {
            setIsDeleting(false)
            toast({
                title: "Error al eliminar",
                description: result.error,
                variant: "destructive"
            })
        }
    }

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="contents">
                {triggerButton}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-200">
                    <div
                        className="absolute inset-0"
                        onClick={() => !isDeleting && !isUpdating && setIsOpen(false)}
                    />
                    <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <Settings2 className="text-gray-400" size={18} />
                                <h3 className="font-bold text-gray-900">Administrar Unidad</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                disabled={isDeleting || isUpdating}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">

                            {/* Sección 1: Control de Estado */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estado Actual</label>
                                    {isUpdating && <Loader2 size={12} className="animate-spin text-gray-400" />}
                                </div>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/50 rounded-xl">
                                    <button
                                        onClick={() => handleStatusChange('vacant')}
                                        disabled={isDeleting || isUpdating}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${status !== 'occupied'
                                                ? 'bg-white text-orange-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {status !== 'occupied' ? (
                                            <CheckCircle2 size={14} className="fill-orange-500 text-white" />
                                        ) : (
                                            <Circle size={14} className="text-gray-400" />
                                        )}
                                        Disponible
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('occupied')}
                                        disabled={isDeleting || isUpdating}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${status === 'occupied'
                                                ? 'bg-white text-emerald-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {status === 'occupied' ? (
                                            <CheckCircle2 size={14} className="fill-emerald-500 text-white" />
                                        ) : (
                                            <Circle size={14} className="text-gray-400" />
                                        )}
                                        Ocupado
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* Sección 2: Zona de Peligro */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-red-400 uppercase tracking-wider">Zona de Peligro</label>
                                <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
                                    <h4 className="text-sm font-bold text-red-900 mb-1">Eliminar Unidad</h4>
                                    <p className="text-[11px] text-red-700/80 mb-4 leading-relaxed">Esta acción removerá "{propertyTitle}" permanentemente. Se borrarán todos los registros asociados.</p>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting || isUpdating}
                                        className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 font-bold py-2.5 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-sm active:scale-95 shadow-sm"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <><Trash2 size={16} /> Eliminar Propiedad</>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
