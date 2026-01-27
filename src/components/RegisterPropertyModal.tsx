"use client";

import { useState } from "react";
import { SimpleModal } from "./SimpleModal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
// import { registerProperty } from "@/app/actions/dashboard";
import { useToast } from "@/hooks/use-toast";

interface RegisterPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RegisterPropertyModal({ isOpen, onClose }: RegisterPropertyModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            const res = await fetch('/api/host/properties/register', { method: 'POST', body: formData });
            const json = await res.json();
            setLoading(false);

            if (!json.success) {
                toast({
                    title: "Error",
                    description: json.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "¡Éxito!",
                    description: "Propiedad registrada correctamente.",
                });
                onClose();
                window.location.reload();
            }
        } catch (e) {
            setLoading(false);
            toast({ title: "Error de conexión", variant: "destructive" });
        }
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Nueva Propiedad"
        >
            <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Nombre del Edificio / Propiedad</Label>
                    <Input name="title" placeholder="Ej. Edificio H2 Plaza" required disabled={loading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Dirección / Apto</Label>
                    <Input name="address" placeholder="Ej. Apto 1201" required disabled={loading} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="bedrooms">Habitaciones</Label>
                        <Input name="bedrooms" type="number" placeholder="2" disabled={loading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image_url">URL de Imagen</Label>
                        <Input name="image_url" placeholder="https://..." disabled={loading} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ical_url">Link de Calendario (Airbnb iCal)</Label>
                    <Input name="ical_url" placeholder="https://airbnb.com/calendar/..." disabled={loading} />
                    <p className="text-xs text-gray-400">Opcional. Sincroniza reservas automáticamente.</p>
                </div>
                <Button
                    type="submit"
                    className="w-full bg-[#FF5A5F] hover:bg-[#E03E43] mt-4"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span> Registrando...
                        </>
                    ) : (
                        "Registrar Propiedad"
                    )}
                </Button>
            </form>
        </SimpleModal>
    );
}
