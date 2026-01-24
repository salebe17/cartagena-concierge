"use client";

import { Search, Star, Home, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";

// Placeholder Category Component
const CategoryBox = ({ icon: Icon, label, selected }: any) => (
    <div className={`
    flex flex-col items-center justify-center gap-2 p-3 border-b-2 hover:text-gray-800 transition cursor-pointer min-w-24
    ${selected ? 'border-black text-black' : 'border-transparent text-gray-500'}
  `}>
        <Icon size={26} />
        <span className="font-medium text-xs">{label}</span>
    </div>
);

// Placeholder Service Card
const ServiceCard = ({ title, desc, price, rating, image }: any) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200 mb-3">
            {/* Placeholder for real images using a nice gradient or generated asset later */}
            <div className={`absolute inset-0 bg-gradient-to-br ${image} group-hover:scale-105 transition duration-300`}></div>
            <div className="absolute top-3 right-3">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: "block", fill: "rgba(0, 0, 0, 0.5)", height: "24px", width: "24px", stroke: "white", strokeWidth: 2, overflow: "visible" }}><path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z"></path></svg>
            </div>
        </div>
        <div className="font-semibold text-lg leading-tight text-[#222222]">{title}</div>
        <div className="text-[#717171] leading-tight mt-1">{desc}</div>
        <div className="flex items-center gap-1 mt-2">
            <span className="font-semibold text-[#222222]">{price}</span>
            <span className="text-[#222222]">créditos</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-sm">
            <Star size={14} className="fill-black text-black" />
            <span>{rating}</span>
        </div>
    </div>
);

export default function HostLanding() {
    return (
        <div className="min-h-screen bg-white pb-20">
            <Navbar />

            {/* Categories Bar (Pseudo-Sticky) */}
            <div className="pt-24 pb-4 px-4 md:px-20 border-b border-gray-100 flex items-center gap-8 overflow-x-auto no-scrollbar justify-start md:justify-center">
                <CategoryBox icon={Home} label="Limpieza" selected />
                <CategoryBox icon={Truck} label="Logística" />
                <CategoryBox icon={ShieldCheck} label="Mantenimiento" />
                <CategoryBox icon={Star} label="Guest VIP" />
            </div>

            {/* Main Content Grid */}
            <main className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-8">

                {/* Hero Banner for Hosts */}
                <div className="mb-12 bg-[#F7F7F7] rounded-2xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold text-[#222222] tracking-tight">
                            Tu coanfitrión <span className="text-[#FF5A5F]">experto</span> en Cartagena.
                        </h1>
                        <p className="text-lg text-[#717171]">
                            Delega la operatividad. Nosotros nos encargamos de las sábanas, las llaves y las emergencias a las 2 a.m.
                        </p>
                        <button className="btn-primary shadow-lg text-lg px-8 py-4">
                            Empezar Ahora
                        </button>
                    </div>

                    {/* Visual Abstract Shape for now */}
                    <div className="h-64 w-64 md:h-96 md:w-96 bg-gradient-to-tr from-[#FF5A5F] to-rose-300 rounded-full blur-3xl opacity-20 absolute right-0 md:right-20 -z-10"></div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform rotate-[-3deg]">
                            <CheckCircle2 className="text-green-500 mb-2" />
                            <div className="font-bold text-sm">Check-in Automático</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform rotate-[2deg] translate-y-4">
                            <CheckCircle2 className="text-green-500 mb-2" />
                            <div className="font-bold text-sm">Limpieza 5 Estrellas</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform rotate-[1deg]">
                            <CheckCircle2 className="text-green-500 mb-2" />
                            <div className="font-bold text-sm">Soporte 24/7</div>
                        </div>
                    </div>
                </div>

                {/* Services Grid (Airbnb Style) */}
                <h2 className="text-2xl font-bold text-[#222222] mb-6">Soluciones Populares</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    <ServiceCard
                        title="Limpieza Profunda Express"
                        desc="Ideal para check-outs rápidos entre reservas muy pegadas."
                        price="80"
                        rating="4.92"
                        image="from-blue-200 to-cyan-200"
                    />
                    <ServiceCard
                        title="Kit de Bienvenida Premium"
                        desc="Vino, café local y frutas tropicales para sorprender."
                        price="120"
                        rating="5.0"
                        image="from-orange-200 to-amber-200"
                    />
                    <ServiceCard
                        title="Reparación A/C Urgente"
                        desc="Técnicos certificados en sitio en menos de 2 horas."
                        price="250"
                        rating="4.85"
                        image="from-gray-200 to-slate-300"
                    />
                    <ServiceCard
                        title="Gestión de Llaves 24/7"
                        desc="Entrega y recogida segura para huéspedes a cualquier hora."
                        price="45"
                        rating="4.98"
                        image="from-purple-200 to-pink-200"
                    />
                    <ServiceCard
                        title="Lavandería de Blancos"
                        desc="Recogida y entrega de sábanas y toallas de hotel."
                        price="60"
                        rating="4.95"
                        image="from-emerald-200 to-green-100"
                    />
                </div>

            </main>
        </div>
    );
}
