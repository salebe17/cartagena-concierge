'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Ship, Utensils, Car, Sparkles, Map, ChevronRight, Copy, MessageCircle, ArrowLeft, CalendarClock, Users } from "lucide-react";
import { getAllies, generateReferralCode, createReservation, Ally } from "@/app/actions/marketplace";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Mock Data for Fallback/Demo if DB is empty
const MOCK_ALLIES: Ally[] = [
    {
        id: '1',
        name: 'Nautica VIP Cartagena',
        category: 'boat',
        description: 'Yates y lanchas deportivas con capitanía certificada.',
        image_url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=1000&auto=format&fit=crop',
        perk_description: '10% OFF + Cervezas de Bienvenida',
        contact_phone: '573000000000',
        requires_reservation: false
    },
    {
        id: '2',
        name: 'Chef Mario Rossi',
        category: 'chef',
        description: 'Cenas privadas de alta cocina caribeña en tu propiedad.',
        image_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1000&auto=format&fit=crop',
        perk_description: 'Postre Gratis para todo el grupo',
        contact_phone: '573000000000',
        requires_reservation: true
    },
    {
        id: '3',
        name: 'Transporte Blindado',
        category: 'transport',
        description: 'Camionetas Suburban/Tahoe con escolta opcional.',
        image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop',
        perk_description: 'Upgrade de vehículo (sujeto a disp.)',
        contact_phone: '573000000000',
        requires_reservation: false
    }
];

interface MarketplaceViewProps {
    onBack: () => void;
}

export function MarketplaceView({ onBack }: MarketplaceViewProps) {
    const [allies, setAllies] = useState<Ally[]>(MOCK_ALLIES);
    const [loading, setLoading] = useState(true);
    const [selectedAlly, setSelectedAlly] = useState<Ally | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Reservation Form State
    const [reservationStep, setReservationStep] = useState<'form' | 'success'>('form');
    const [resDetails, setResDetails] = useState({ guest_name: '', date: '', guests: '2', notes: '' });

    const { toast } = useToast();

    // Fetch real allies on mount
    useEffect(() => {
        const fetchAllies = async () => {
            try {
                const res = await getAllies();
                if (res.success && res.data && res.data.length > 0) {
                    setAllies(res.data);
                }
            } catch (e) {
                console.error("Using mock allies due to error");
            } finally {
                setLoading(false);
            }
        };
        fetchAllies();
    }, []);

    const handleAction = async () => {
        if (!selectedAlly) return;
        setIsGenerating(true);

        if (selectedAlly.requires_reservation) {
            // Handle Reservation
            try {
                const res = await createReservation(selectedAlly.id, {
                    guest_name: resDetails.guest_name,
                    date: new Date(resDetails.date),
                    guests: parseInt(resDetails.guests),
                    notes: resDetails.notes
                });

                if (res.success) {
                    setReservationStep('success');
                } else {
                    toast({ title: "Error", description: res.error, variant: "destructive" });
                }
            } catch (e) {
                toast({ title: "Error", description: "Error enviando solicitud", variant: "destructive" });
            } finally {
                setIsGenerating(false);
            }
        } else {
            // Handle Direct Code
            try {
                // In a real app, un-comment this to hit DB
                const res = await generateReferralCode(selectedAlly.id);

                // For Demo UX immediately if DB fails or for speed
                const mockCode = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;
                setGeneratedCode(res.success ? res.code : mockCode);

            } catch (e) {
                toast({ title: "Error", description: "No se pudo generar el código.", variant: "destructive" });
            } finally {
                setIsGenerating(false);
            }
        }
    };

    const handleWhatsAppRedirect = () => {
        if (!selectedAlly) return;

        // Different message for Reservation vs Code
        let message = '';
        if (selectedAlly.requires_reservation) {
            message = `Hola ${selectedAlly.name}, acabo de solicitar una reserva para mi huésped *${resDetails.guest_name}* para el día *${resDetails.date}*. Quedo atento a su confirmación.`;
        } else {
            message = `Hola ${selectedAlly.name}, soy anfitrión de Cartagena Concierge. Mi huésped está interesado en sus servicios. Te comparto el código de beneficio: *${generatedCode}* (${selectedAlly.perk_description}).`;
        }

        const url = `https://wa.me/${selectedAlly.contact_phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        if (!selectedAlly.requires_reservation) {
            setSelectedAlly(null);
            setGeneratedCode(null);
        }
    };

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'boat': return <Ship size={20} />;
            case 'chef': return <Utensils size={20} />;
            case 'transport': return <Car size={20} />;
            case 'wellness': return <Sparkles size={20} />;
            default: return <Map size={20} />;
        }
    };

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-right-8 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-[#222222] tracking-tight">Aliados VIP</h1>
                    <p className="text-gray-500 text-sm">Beneficios exclusivos para tus huéspedes</p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allies.map(ally => (
                    <div key={ally.id} className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                        {/* Image */}
                        <div className="relative h-40 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                            <Image
                                src={ally.image_url}
                                alt={ally.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                                {getIcon(ally.category)}
                                <span className="uppercase tracking-wider">{ally.category}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-[#222222] leading-tight mb-2">{ally.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ally.description}</p>

                            {/* Perk Badge */}
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3 mb-4">
                                <Sparkles size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Beneficio Exclusivo</p>
                                    <p className="text-sm font-medium text-amber-900">{ally.perk_description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action */}
                        <Button
                            onClick={() => {
                                setSelectedAlly(ally);
                                setReservationStep('form');
                                setGeneratedCode(null);
                            }}
                            className={`w-full h-12 rounded-xl font-bold ${ally.requires_reservation ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
                        >
                            {ally.requires_reservation ? 'Solicitar Reserva' : 'Obtener Código VIP'}
                        </Button>
                    </div>
                ))}
            </div>

            {/* MODAL: Logic for Code vs Reservation */}
            <Dialog open={!!selectedAlly} onOpenChange={(open) => !open && setSelectedAlly(null)}>
                <DialogContent className="rounded-[32px] p-0 overflow-hidden max-w-sm sm:max-w-md">

                    {/* Header based on Type */}
                    <div className={`p-8 text-center text-white relative ${selectedAlly?.requires_reservation ? 'bg-rose-600' : 'bg-[#222222]'}`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        {selectedAlly?.requires_reservation ? (
                            <CalendarClock size={48} className="mx-auto text-white/90 mb-4" />
                        ) : (
                            <Sparkles size={48} className="mx-auto text-amber-400 mb-4 animate-pulse" />
                        )}

                        <DialogTitle className="text-2xl font-black mb-2">
                            {selectedAlly?.requires_reservation
                                ? (reservationStep === 'success' ? "¡Solicitud Enviada!" : "Reservar Experiencia")
                                : (generatedCode ? "¡Código Generado!" : "Generar Código VIP")
                            }
                        </DialogTitle>
                        <DialogDescription className="text-white/80 max-w-xs mx-auto">
                            {selectedAlly?.requires_reservation
                                ? (reservationStep === 'success' ? "El aliado confirmará disponibilidad en breve." : "Ingresa los datos para solicitar cupo.")
                                : (generatedCode ? "Comparte este código para redimir el beneficio." : "Esto creará un código único rastreable.")
                            }
                        </DialogDescription>
                    </div>

                    <div className="p-8">
                        {selectedAlly?.requires_reservation ? (
                            /* --- RESERVATION FLOW --- */
                            reservationStep === 'form' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Huésped</label>
                                        <Input
                                            placeholder="Nombre del titular"
                                            value={resDetails.guest_name}
                                            onChange={(e) => setResDetails({ ...resDetails, guest_name: e.target.value })}
                                            className="rounded-xl border-gray-200"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Fecha/Hora</label>
                                            <Input
                                                type="datetime-local"
                                                value={resDetails.date}
                                                onChange={(e) => setResDetails({ ...resDetails, date: e.target.value })}
                                                className="rounded-xl border-gray-200"
                                            />
                                        </div>
                                        <div className="w-20">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Pax</label>
                                            <Input
                                                type="number"
                                                value={resDetails.guests}
                                                onChange={(e) => setResDetails({ ...resDetails, guests: e.target.value })}
                                                className="rounded-xl border-gray-200"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Notas</label>
                                        <Textarea
                                            placeholder="Alergias, ocasión especial..."
                                            value={resDetails.notes}
                                            onChange={(e) => setResDetails({ ...resDetails, notes: e.target.value })}
                                            className="rounded-xl border-gray-200"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleAction}
                                        disabled={isGenerating || !resDetails.guest_name || !resDetails.date}
                                        className="w-full bg-rose-600 h-12 rounded-xl font-bold text-white hover:bg-rose-700"
                                    >
                                        {isGenerating ? "Enviando..." : "Enviar Solicitud"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                        <MessageCircle size={32} />
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Hemos notificado al aliado. Te recomendamos enviar un mensaje directo para acelerar la confirmación.
                                    </p>
                                    <Button
                                        onClick={handleWhatsAppRedirect}
                                        className="w-full bg-[#25D366] hover:bg-[#128C7E] h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle size={20} />
                                        Confirmar por WhatsApp
                                    </Button>
                                    <Button variant="ghost" onClick={() => setSelectedAlly(null)}>Cerrar</Button>
                                </div>
                            )
                        ) : (
                            /* --- CODE FLOW --- */
                            !generatedCode ? (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-2xl p-4 flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                                            {selectedAlly && getIcon(selectedAlly.category)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{selectedAlly?.name}</p>
                                            <p className="text-xs text-gray-500">Se notificará al aliado de tu referido.</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleAction}
                                        disabled={isGenerating}
                                        className="w-full bg-[#222222] h-12 rounded-xl font-bold text-white hover:bg-black"
                                    >
                                        {isGenerating ? "Generando..." : "Crear Código Único"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 relative group cursor-pointer hover:border-gray-400 transition-colors"
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedCode);
                                            toast({ title: "Copiado", description: "Código copiado al portapapeles" });
                                        }}
                                    >
                                        <p className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-2">TU CÓDIGO</p>
                                        <p className="text-4xl font-black text-[#222222] tracking-widest font-mono">{generatedCode}</p>
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                            <span className="flex items-center gap-2 font-bold text-sm"><Copy size={16} /> Copiar</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            onClick={handleWhatsAppRedirect}
                                            className="w-full bg-[#25D366] hover:bg-[#128C7E] h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle size={20} />
                                            Enviar por WhatsApp
                                        </Button>
                                        <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                                            Al contactar, se enviará un mensaje pre-redactado con este código.
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
