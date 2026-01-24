"use client";

import { LucideIcon, Star, Home, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";

// Placeholder Category Component
interface CategoryBoxProps {
    icon: LucideIcon;
    label: string;
    selected?: boolean;
}

const CategoryBox = ({ icon: Icon, label, selected }: CategoryBoxProps) => (
    <div className={`
    flex flex-col items-center justify-center gap-2 p-3 border-b-2 hover:text-gray-800 transition cursor-pointer min-w-24
    ${selected ? 'border-black text-black' : 'border-transparent text-gray-500'}
  `}>
        <Icon size={26} />
        <span className="font-medium text-xs">{label}</span>
    </div>
);

// Placeholder Service Card
interface ServiceCardProps {
    title: string;
    desc: string;
    price: string;
    rating: string;
    image: string;
}

const ServiceCard = ({ title, desc, price, rating, image }: ServiceCardProps) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-gray-100 mb-4 border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-500">
            <div className={`absolute inset-0 bg-gradient-to-br ${image} group-hover:scale-110 transition duration-700 ease-out opacity-80`}></div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
            <div className="absolute top-4 right-4">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: "block", fill: "rgba(0, 0, 0, 0.4)", height: "24px", width: "24px", stroke: "white", strokeWidth: 2.5, overflow: "visible" }}><path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z"></path></svg>
            </div>
        </div>
        <div className="font-bold text-base leading-tight text-[#222222] group-hover:text-rose-500 transition-colors uppercase tracking-tight">{title}</div>
        <div className="text-[13px] text-[#717171] leading-snug mt-1.5 line-clamp-2 font-medium">{desc}</div>
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1">
                <span className="font-black text-[#222222]">${price}k</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">COP</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#222222] bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                <Star size={12} className="fill-rose-500 text-rose-500" />
                <span>{rating}</span>
            </div>
        </div>
    </div>
);

export default function HostLanding() {
    const handleScrollToServices = () => {
        const element = document.getElementById('solutions-grid');
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            <Navbar />

            {/* Categories Bar (Pseudo-Sticky) */}
            <div className="pt-24 pb-4 px-4 md:px-20 border-b border-gray-100 flex items-center gap-8 overflow-x-auto no-scrollbar justify-start md:justify-center bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <CategoryBox icon={Home} label="Limpieza" selected />
                <CategoryBox icon={Truck} label="Logística" />
                <CategoryBox icon={ShieldCheck} label="Mantenimiento" />
                <CategoryBox icon={Star} label="Guest VIP" />
            </div>

            {/* Main Content Grid */}
            <main className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-12">

                {/* Hero Banner for Hosts */}
                <div className="mb-20 bg-white rounded-[40px] p-8 md:p-24 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden border border-gray-100 shadow-airbnb">
                    {/* Background High-Res Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/cartagena_property_host_1769230982162.png"
                            alt="Luxury Cartagena Property"
                            fill
                            className="object-cover opacity-20 scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
                    </div>

                    <div className="max-w-xl space-y-10 relative z-10">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-black tracking-[0.2em] uppercase">
                            Premium Host Solutions
                        </div>
                        <h1 className="text-4xl xs:text-5xl md:text-8xl font-black text-[#222222] tracking-tighter leading-[0.95] md:leading-[0.9]">
                            Tu coanfitrión <span className="text-[#FF5A5F]">experto</span> <br className="hidden xs:block" /> en Cartagena.
                        </h1>
                        <p className="text-lg md:text-xl text-[#717171] leading-relaxed font-medium max-w-md">
                            Delega la operatividad. Nosotros nos encargamos de las sábanas, las llaves y las emergencias.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Link href="/business" className="btn-primary shadow-hero text-base md:text-lg px-8 md:px-12 py-4 md:py-5 text-center transform hover:scale-105 transition-all">
                                Gestionar Propiedad
                            </Link>
                            <button
                                onClick={handleScrollToServices}
                                className="px-8 md:px-12 py-4 md:py-5 rounded-2xl border-2 border-gray-100 text-[#222222] font-bold text-base md:text-lg hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Ver Servicios
                            </button>
                        </div>
                    </div>

                    <div className="hidden sm:grid grid-cols-2 gap-8 relative z-10">
                        <div className="glass p-10 rounded-[32px] shadow-airbnb transform rotate-[-3deg] hover:rotate-0 transition-all duration-700 animate-in slide-in-from-left-8">
                            <CheckCircle2 className="text-rose-500 mb-4" size={40} />
                            <div className="font-black text-xl text-[#222222]">Check-in 24/7</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Garantizado</div>
                        </div>
                        <div className="glass p-10 rounded-[32px] shadow-airbnb transform rotate-[2deg] translate-y-16 hover:translate-y-8 transition-all duration-700 delay-100 animate-in slide-in-from-bottom-8">
                            <Star className="text-amber-400 mb-4 fill-amber-400" size={40} />
                            <div className="font-black text-xl text-[#222222]">Limpieza 5.0</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Estándar Hotel</div>
                        </div>
                    </div>
                </div>

                {/* Services Grid (Airbnb Style) */}
                <div id="solutions-grid" className="scroll-mt-32">
                    <h2 className="text-2xl md:text-4xl font-black text-[#222222] mb-8 md:mb-12 tracking-tighter">Soluciones Premium</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 md:gap-x-12 gap-y-10 md:gap-y-16">
                        <ServiceCard
                            title="Limpieza Hotelera"
                            desc="Incluye insumos (papel, jabón), reporte fotográfico y check de inventario."
                            price="55"
                            rating="4.92"
                            image="from-rose-100 to-rose-200"
                        />
                        <ServiceCard
                            title="Lavandería Lencería"
                            desc="Recogida y entrega de sábanas y toallas en 24h. Doblado profesional."
                            price="35"
                            rating="5.0"
                            image="from-indigo-100 to-indigo-200"
                        />
                        <ServiceCard
                            title="Soporte Técnico"
                            desc="Aires acondicionados, cerrajería y reparaciones express de emergencia."
                            price="50"
                            rating="4.85"
                            image="from-blue-100 to-blue-200"
                        />
                        <ServiceCard
                            title="Lavado Muebles"
                            desc="Limpieza por inyección y succión de sofás y alfombras."
                            price="35"
                            rating="4.98"
                            image="from-cyan-100 to-cyan-200"
                        />
                        <ServiceCard
                            title="Mercado & Insumos"
                            desc="Abastecemos tu propiedad con víveres y suministros básicos."
                            price="15"
                            rating="4.95"
                            image="from-emerald-100 to-emerald-200"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
