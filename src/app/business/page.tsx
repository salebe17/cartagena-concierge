"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Key, Truck, ShieldCheck } from "lucide-react";
import { ThirdwebProvider, ConnectButton, useActiveAccount } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { getThirdwebClient, getChain } from "@/lib/thirdweb";

const client = getThirdwebClient();
const chain = getChain();
import { HostCatalog } from "@/components/HostCatalog";
import Navbar from "@/components/Navbar";

const wallets = [
    inAppWallet({
        auth: {
            options: ["google", "apple", "email"],
        },
    }),
];

function BusinessContent() {
    const account = useActiveAccount();

    return (
        <div className="min-h-screen bg-white text-[#222222] font-sans pb-20">
            <Navbar />

            <main className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-12 pt-28">

                {account ? (
                    <HostCatalog />
                ) : (
                    <>
                        {/* Hero Section */}
                        <div className="text-center mb-24 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 pt-16">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-gray-50 text-[10px] font-black tracking-[0.2em] uppercase border border-gray-100 shadow-sm">
                                Cartagena Concierge for Business
                            </div>
                            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] text-[#222222] tracking-tighter">
                                Operatividad <br />
                                <span className="text-[#FF5A5F]">
                                    Escalable.
                                </span>
                            </h1>
                            <p className="text-[#717171] max-w-2xl mx-auto text-xl leading-relaxed font-medium px-4">
                                Potenciamos a administradores y empresas de renta corta con logística de estándar hotelero.
                                Recupera tu tiempo mientras nosotros cuidamos tus activos.
                            </p>
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                            {/* Card 1 */}
                            <div className="glass p-10 rounded-[40px] border-white/60 shadow-airbnb hover:translate-y-[-8px] transition-all duration-500">
                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                                    <Key className="w-8 h-8 text-[#FF5A5F]" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tight text-[#222222]">Guest Centric</h3>
                                <p className="text-[#717171] text-base leading-relaxed font-medium">
                                    Kits de bienvenida de lujo, check-ins presenciales y atención prioritaria para garantizar reseñas 5 estrellas.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="glass p-10 rounded-[40px] border-white/60 shadow-airbnb hover:translate-y-[-8px] transition-all duration-500 delay-100">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                                    <Truck className="w-8 h-8 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tight text-[#222222]">Hands-Off Logistics</h3>
                                <p className="text-[#717171] text-base leading-relaxed font-medium">
                                    Mantenimiento preventivo, inventarios inteligentes y reposición de insumos sin que tengas que intervenir.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="glass p-10 rounded-[40px] border-white/60 shadow-airbnb hover:translate-y-[-8px] transition-all duration-500 delay-200">
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                                    <ShieldCheck className="w-8 h-8 text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tight text-[#222222]">Safe & Secure</h3>
                                <p className="text-[#717171] text-base leading-relaxed font-medium">
                                    Protocolos de seguridad verificados, inspección técnica periódica y respuesta ante emergencias 24/7.
                                </p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="relative rounded-[48px] overflow-hidden border border-gray-100 bg-gray-900 shadow-hero">
                            <div className="relative p-12 md:p-24 text-center space-y-10 group">
                                <Building2 className="w-20 h-20 text-white/10 mx-auto mb-4 group-hover:scale-110 transition-transform duration-700" />
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">¿Gestionas un <br className="md:hidden" /> Portfolio?</h2>
                                <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-medium">
                                    Diseñamos planes a medida para carteras de +10 propiedades con facturación consolidada y SLAs garantizados.
                                </p>
                                <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="https://wa.me/573000000000?text=Hola,%20me%20interesa%20una%20cuenta%20corporativa%20para%20mis%20propiedades."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-12 py-5 bg-[#FF5A5F] hover:bg-rose-600 text-white font-black text-lg rounded-2xl transition-all shadow-xl active:scale-95"
                                    >
                                        Hablar con un Key Account Manager
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default function BusinessPage() {
    return (
        <ThirdwebProvider>
            <BusinessContent />
        </ThirdwebProvider>
    );
}
