'use client'

import { useState } from 'react'
import { deleteProperty, updatePropertyStatus } from '@/app/actions/dashboard'
import { X, Trash2, Settings2, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
    const [status, setStatus] = useState(currentStatus)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()

    // Manejar cambio de estado (Ocupado/Vacante)
    const handleStatusChange = async (newStatus: 'vacant' | 'occupied') => {
        if (newStatus === status) return;

        // Optimistic Update
        const previousStatus = status;
        setStatus(newStatus);
        setIsUpdating(true);

        const result = await updatePropertyStatus(propertyId, newStatus)
        setIsUpdating(false)

        if (result.success) {
            toast({
                title: "Estado actualizado",
                description: `${propertyTitle} ahora está ${newStatus === 'occupied' ? 'Ocupado' : 'Disponible'}.`,
            })
        } else {
            setStatus(previousStatus) // Revertir si falla
            toast({
                title: "Error al actualizar",
                description: result.error,
                variant: "destructive"
            })
        }
    }

    // Manejar eliminación
    const handleDelete = async () => {
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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
                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => handleStatusChange('vacant')}
                                        disabled={isUpdating}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${status !== 'occupied'
                                            ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
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
                                        disabled={isUpdating}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${status === 'occupied'
                                            ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5'
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

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-all text-sm active:scale-95 shadow-sm">
                                            {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                            Eliminar Propiedad
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-2xl border-gray-100">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-xl">¿Eliminar esta propiedad?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción eliminará <strong>{propertyTitle}</strong> y todo su historial de servicios permanentemente. No se puede deshacer.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-xl border-0 bg-gray-100 font-bold">Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="rounded-xl bg-red-600 font-bold hover:bg-red-700 text-white"
                                            >
                                                Sí, eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
