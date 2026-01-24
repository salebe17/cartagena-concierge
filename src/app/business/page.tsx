"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Key, Truck, ShieldCheck } from "lucide-react";
import { ThirdwebProvider, ConnectButton, useActiveAccount } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { client, chain } from "@/lib/thirdweb";
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
                        <div className="text-center mb-24 space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700 pt-10">
                            <div className="inline-block px-4 py-1 rounded-full border border-gray-200 bg-gray-50 text-[#222222] text-xs font-bold tracking-widest uppercase mb-4">
                                Para Anfitriones & Empresas
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-[#222222] tracking-tight">
                                Eleva tu <br />
                                <span className="text-[#FF5A5F]">
                                    Estándar.
                                </span>
                            </h1>
                            <p className="text-[#717171] max-w-2xl mx-auto text-lg leading-relaxed">
                                Soluciones logísticas de alta gama para administradores de propiedades, Airbnb y hoteles boutique.
                                Delega la operatividad, nosotros nos encargamos de la excelencia.
                            </p>
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                            {/* Card 1 */}
                            <div className="group bg-white hover:bg-[#F7F7F7] border border-gray-200 p-8 rounded-2xl transition-all duration-300">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                                    <Key className="w-6 h-6 text-[#FF5A5F]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide text-[#222222]">Guest Experience</h3>
                                <p className="text-[#717171] text-sm leading-relaxed">
                                    Kits de bienvenida premium, check-ins VIP y atención 24/7 para tus huéspedes más exigentes.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="group bg-white hover:bg-[#F7F7F7] border border-gray-200 p-8 rounded-2xl transition-all duration-300">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                                    <Truck className="w-6 h-6 text-[#FF5A5F]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide text-[#222222]">Logística & Insumos</h3>
                                <p className="text-[#717171] text-sm leading-relaxed">
                                    Restocking automático de amenities, entregas de emergencia y gestión de compras grandes.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="group bg-white hover:bg-[#F7F7F7] border border-gray-200 p-8 rounded-2xl transition-all duration-300">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-6 h-6 text-[#FF5A5F]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide text-[#222222]">Mantenimiento Exprés</h3>
                                <p className="text-[#717171] text-sm leading-relaxed">
                                    Plomería, aire acondicionado y reparaciones urgentes en menos de 2 horas.
                                </p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-[#F7F7F7] shadow-none">
                            <div className="relative p-12 md:p-20 text-center space-y-8">
                                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h2 className="text-3xl md:text-5xl font-bold text-[#222222] tracking-tight">¿Administras más de 3 propiedades?</h2>
                                <p className="text-[#717171] max-w-xl mx-auto">
                                    Obtén acceso a nuestra cuenta corporativa con líneas de crédito, facturación mensual y manager dedicado.
                                </p>
                                <div className="pt-4">
                                    <a
                                        href="https://wa.me/573000000000?text=Hola,%20me%20interesa%20una%20cuenta%20corporativa%20para%20mis%20propiedades."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-8 py-4 bg-[#222222] hover:bg-black text-white font-bold text-sm rounded-xl transition-colors"
                                    >
                                        Contactar Ventas
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
