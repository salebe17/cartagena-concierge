'use client';

import { ArrowLeft, Book, MessageCircle, FileText, ChevronDown, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HelpViewProps {
    onBack: () => void;
    onGoToChat: () => void; // Redirect to chat tab
}

export function HelpView({ onBack, onGoToChat }: HelpViewProps) {
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const faqs = [
        {
            id: 'market',
            question: '¿Cómo funcionan los Aliados VIP?',
            answer: 'Puedes generar códigos de descuento únicos para tus huéspedes en la sección "Aliados VIP". Ellos reciben un beneficio exclusivo (ej. cervezas gratis en bote) y tú aseguras que el servicio sea de calidad garantizada.'
        },
        {
            id: 'money',
            question: '¿Cuándo recibo mis pagos?',
            answer: 'Los pagos de estancias se procesan 24 horas después del check-in. Los servicios adicionales se facturan mensualmente y verás el desglose en la sección "Finanzas".'
        },
        {
            id: 'damage',
            question: '¿Qué hago si hay un daño en la propiedad?',
            answer: 'Reportalo inmediatamente a través del Chat de Soporte. Nuestro equipo de mantenimiento realizará una inspección técnica para gestionar el cobro de la fianza si es necesario.'
        },
        {
            id: 'clean',
            question: '¿Cómo programo una limpieza de salida?',
            answer: 'En el "Calendario", selecciona la reserva y elige la opción "Programar Limpieza". También puedes hacerlo desde la pestaña "Servicios".'
        }
    ];

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-right-8 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-[#222222] tracking-tight">Centro de Ayuda</h1>
                    <p className="text-gray-500 text-sm">Resuelve tus dudas sobre la plataforma</p>
                </div>
            </div>

            {/* Support Hero */}
            <div className="bg-[#222222] rounded-[32px] p-6 text-white text-center mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-black mb-2">¿Tienes una urgencia operativa?</h2>
                    <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                        Para fugas, daños, problemas con huéspedes o acceso, contacta a nuestro equipo en vivo.
                    </p>
                    <Button
                        onClick={onGoToChat}
                        className="bg-white text-black hover:bg-gray-200 rounded-full font-bold px-8 h-12"
                    >
                        <MessageCircle size={18} className="mr-2" />
                        Ir al Chat de Soporte
                    </Button>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#222222] text-sm">Términos</h3>
                        <p className="text-xs text-gray-400">Contratos y reglas</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
                        <PlayCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#222222] text-sm">Tutoriales</h3>
                        <p className="text-xs text-gray-400">Aprende a usar la app</p>
                    </div>
                </div>
            </div>

            {/* FAQs */}
            <h3 className="text-xl font-black text-[#222222] mb-4 px-2">Preguntas Frecuentes</h3>
            <div className="space-y-4">
                {faqs.map(faq => (
                    <div key={faq.id} className="bg-white rounded-[24px] border border-gray-100 overflow-hidden transition-all shadow-sm">
                        <button
                            onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                            className="w-full flex items-center justify-between p-5 text-left"
                        >
                            <span className="font-bold text-[#222222] text-sm pr-4">{faq.question}</span>
                            <ChevronDown
                                size={20}
                                className={`text-gray-400 transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {openFaq === faq.id && (
                            <div className="px-5 pb-5 text-sm text-gray-500 animate-in fade-in slide-in-from-top-2 duration-200">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
