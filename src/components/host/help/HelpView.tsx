'use client';

import { ArrowLeft, Book, MessageCircle, FileText, ChevronDown, PlayCircle, Wrench, Sparkles, Ship, ShieldCheck, CreditCard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HelpViewProps {
    onBack: () => void;
    onGoToChat: () => void;
}

export function HelpView({ onBack, onGoToChat }: HelpViewProps) {
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const faqs = [
        {
            id: 'damage',
            question: '¿Un huésped reportó un daño?',
            answer: 'Documenta todo con fotos inmediatamente y repórtalo en el Centro de Resoluciones de Airbnb para proteger tu fianza. Si necesitas reparación urgente, usa nuestra sección "Servicios" para enviar un técnico verificado.'
        },
        {
            id: 'clean_extra',
            question: '¿Necesitas limpieza profunda post-checkout?',
            answer: 'Nuestros equipos de "Limpieza Diamante" están especializados en devolver el brillo a tu propiedad. Programalo desde la pestaña Servicios y garantiza 5 estrellas en limpieza.',
            action: 'Ir a Servicios'
        },
        {
            id: 'allies',
            question: '¿Quieres ganar comisiones extra?',
            answer: 'Ofrece a tus huéspedes nuestros Aliados VIP (Botes, Chefs). Genera un código en "Aliados VIP & Recursos", envíalo al huésped, y nosotros nos encargamos del resto.'
        },
        {
            id: 'maintenance',
            question: 'El aire acondicionado no enfría',
            answer: 'No pierdas reseñas por calor. Solicita un "Mantenimiento Express" en la app. Nuestros técnicos llevan repuestos universales para soluciones rápidas.'
        },
        {
            id: 'supplies',
            question: 'Reposición de Insumos (Jabón, Papel)',
            answer: 'No corras al supermercado. Pide nuestro "Kit de Bienvenida" en Servicios y recíbelo en la puerta de la propiedad antes de la llegada.'
        },
        {
            id: 'laundry',
            question: 'Servicio de Lavandería de Lencería',
            answer: 'Recogemos sábanas y toallas sucias y te entregamos juegos limpios de calidad hotelera en 24 horas. Solicítalo como "Lavandería Express".'
        },
        {
            id: 'checkin',
            question: 'No puedo recibir al huésped personalmente',
            answer: 'Usa nuestro servicio de "Co-Hitrion Check-in". Un agente uniformado recibirá a tus huéspedes, hará el tour y entregará las llaves por ti.'
        },
        {
            id: 'photo',
            question: 'Mis fotos no atraen reservas',
            answer: 'Agenda una sesión de "Fotografía Profesional Inmobiliaria" con nosotros. Las propiedades con fotos pro reciben un 40% más de clics.'
        },
        {
            id: 'legal',
            question: 'Registro Nacional de Turismo (RNT)',
            answer: '¿Necesitas ayuda renovando tu RNT? Nuestro equipo legal tiene un paquete administrativo para gestionar tus obligaciones fiscales y turísticas.'
        },
        {
            id: 'transport',
            question: 'Huésped necesita transporte del aeropuerto',
            answer: 'Coordina una van privada con nuestros Aliados VIP. Es más seguro que un taxi de calle y tú quedas como un excelente anfitrión.'
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
                    <p className="text-gray-500 text-sm">Respuestas que hacen crecer tu negocio</p>
                </div>
            </div>

            {/* Support Hero */}
            <div className="bg-[#222222] rounded-[32px] p-8 text-white text-center mb-8 relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                        <MessageCircle size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 tracking-tight">Chat de Soporte Técnico</h2>
                    <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                        Para temas urgentes: Fugas, acceso denegado, o reportes de seguridad en tiempo real.
                    </p>
                    <Button
                        onClick={onGoToChat}
                        className="bg-white text-black hover:bg-gray-200 rounded-xl font-bold px-8 h-14 w-full sm:w-auto shadow-sm transition-transform active:scale-95"
                    >
                        Abrir Chat con Operaciones
                    </Button>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-500/20 to-purple-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
            </div>

            {/* FAQs */}
            <h3 className="text-xl font-black text-[#222222] mb-6 px-2 flex items-center gap-2">
                <ShieldCheck size={24} className="text-emerald-500" />
                Preguntas Frecuentes
            </h3>

            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={faq.id} className="bg-white rounded-[24px] border border-gray-100 overflow-hidden transition-all shadow-sm hover:shadow-md group">
                        <button
                            onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                            className="w-full flex items-center justify-between p-5 text-left"
                        >
                            <div className="flex items-start gap-4">
                                <span className="text-gray-300 font-black text-lg select-none">{(idx + 1).toString().padStart(2, '0')}</span>
                                <span className={`font-bold text-sm pr-4 transition-colors ${openFaq === faq.id ? 'text-rose-500' : 'text-[#222222]'}`}>
                                    {faq.question}
                                </span>
                            </div>
                            <ChevronDown
                                size={20}
                                className={`text-gray-400 shrink-0 transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180 text-rose-500' : ''}`}
                            />
                        </button>
                        {openFaq === faq.id && (
                            <div className="px-5 pb-5 pl-14 text-sm text-gray-500 animate-in fade-in slide-in-from-top-2 duration-200">
                                <p className="leading-relaxed mb-3">{faq.answer}</p>
                                {faq.action && (
                                    <button className="text-xs font-bold text-rose-500 uppercase tracking-wider hover:text-rose-700 flex items-center gap-1">
                                        {faq.action} <ArrowLeft size={12} className="rotate-180" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
