"use client";

import { useState } from "react";
import { SimpleModal } from "./SimpleModal";
import { Button } from "./ui/button";
import { deleteProperty, updatePropertyStatus } from "@/app/actions/dashboard";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle, Loader2, Check, Circle } from "lucide-react";

interface ManagePropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: {
        id: string;
        title: string;
        status: string;
    };
}

export function ManagePropertyModal({ isOpen, onClose, property }: ManagePropertyModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleUpdateStatus = async (newStatus: 'occupied' | 'vacant') => {
        setLoading(true);
        const res = await updatePropertyStatus(property.id, newStatus);
        setLoading(false);

        if (res.error) {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        } else {
            toast({ title: "Estado Actualizado", description: `${property.title} ahora está ${newStatus === 'occupied' ? 'Ocupado' : 'Disponible'}.` });
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        setLoading(true);
        const res = await deleteProperty(property.id);
        setLoading(false);

        if (res.error) {
            toast({ title: "Error", description: res.error, variant: "destructive" });
            setConfirmDelete(false);
        } else {
            toast({ title: "Propiedad Eliminada", description: "Se ha removido la unidad de tu portafolio." });
            onClose();
        }
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={() => {
                setConfirmDelete(false);
                onClose();
            }}
            title={`Ajustes: ${property.title}`}
        >
            <div className="space-y-8">
                {/* Section 1: Operational Status */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Estado Operativo</label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => handleUpdateStatus('occupied')}
                            disabled={loading}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${property.status === 'occupied'
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {property.status === 'occupied' ? <Check size={18} /> : <Circle size={18} />}
                            Ocupado
                        </button>
                        <button
                            onClick={() => handleUpdateStatus('vacant')}
                            disabled={loading}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${property.status !== 'occupied'
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {property.status !== 'occupied' ? <Check size={18} /> : <Circle size={18} />}
                            Disponible
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Cambia el estado para indicar si la propiedad está recibiendo huéspedes actualmente.
                    </p>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Section 2: Danger Zone */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-red-600 uppercase tracking-wider">Zona de Peligro</label>
                    <div className={`p-4 rounded-xl border transition-all ${confirmDelete ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                        {confirmDelete ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle size={18} />
                                    <span className="font-bold text-sm">¿Confirmar eliminación?</span>
                                </div>
                                <p className="text-xs text-red-500">Esta acción no se puede deshacer. Se borrarán todos los registros asociados.</p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold h-10"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : "Sí, Eliminar"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setConfirmDelete(false)}
                                        disabled={loading}
                                        className="flex-1 h-10 border-red-200 text-red-600 hover:bg-white"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-gray-900">Eliminar Propiedad</p>
                                    <p className="text-xs text-gray-400">Remover permanentemente del portafolio.</p>
                                </div>
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-gray-400 hover:text-gray-600"
                >
                    Cerrar Ajustes
                </Button>
            </div>
        </SimpleModal>
    );
}
