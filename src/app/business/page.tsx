"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Key, Truck, ShieldCheck } from "lucide-react";
import { ThirdwebProvider, ConnectButton, useActiveAccount } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { client, chain } from "@/lib/thirdweb";
import { HostCatalog } from "@/components/HostCatalog";

const wallets = [
    inAppWallet({
        auth: {
            options: ["google", "apple", "email"],
        },
        smartWallet: {
            chain: chain,
            sponsorGas: true,
        },
    }),
];

function BusinessContent() {
    const account = useActiveAccount();

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-rose-500/30">
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-1 h-8 bg-rose-500"></div>
                        <div>
                            <h1 className="text-lg font-bold tracking-widest text-gray-900 uppercase">Cartagena</h1>
                            <p className="text-[9px] text-rose-500 tracking-[0.3em] uppercase italic">Business</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/" className="hidden md:flex text-xs uppercase tracking-widest hover:text-rose-500 transition-colors items-center gap-2 text-gray-500 font-bold">
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </Link>
                    <ConnectButton
                        client={client}
                        chain={chain}
                        wallets={wallets}
                        theme="light"
                        connectButton={{
                            label: "Ingresar / Registro",
                            className: "!bg-gray-900 !text-white !font-bold !uppercase !tracking-wider !text-xs !rounded-lg hover:!bg-black shadow-lg"
                        }}
                    />
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">

                {account ? (
                    <HostCatalog />
                ) : (
                    <>
                        {/* Hero Section */}
                        <div className="text-center mb-24 space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700 pt-10">
                            <div className="inline-block px-4 py-1 rounded-full border border-rose-100 bg-rose-50 text-rose-600 text-xs font-bold tracking-widest uppercase mb-4">
                                Para Anfitriones & Empresas
                            </div>
                            <h1 className="text-5xl md:text-7xl font-light leading-tight text-gray-900">
                                Eleva tu <br />
                                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                                    Estándar.
                                </span>
                            </h1>
                            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                                Soluciones logísticas de alta gama para administradores de propiedades, Airbnb y hoteles boutique.
                                Delega la operatividad, nosotros nos encargamos de la excelencia.
                            </p>
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 animate-in fade-in zoom-in duration-700 delay-150">
                            {/* Card 1 */}
                            <div className="group bg-white hover:bg-gray-50 border border-gray-100 hover:border-rose-200 p-8 rounded-2xl transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Key className="w-6 h-6 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide text-gray-900">Guest Experience</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Kits de bienvenida premium, check-ins VIP y atención 24/7 para tus huéspedes más exigentes.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="group bg-white hover:bg-gray-50 border border-gray-100 hover:border-rose-200 p-8 rounded-2xl transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Truck className="w-6 h-6 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide text-gray-900">Logística & Insumos</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Restocking automático de amenities, entregas de emergencia y gestión de compras grandes.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="group bg-white hover:bg-gray-50 border border-gray-100 hover:border-rose-200 p-8 rounded-2xl transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-6 h-6 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide text-gray-900">Mantenimiento Exprés</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Plomería, aire acondicionado y reparaciones urgentes en menos de 2 horas.
                                </p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="relative rounded-3xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 shadow-2xl">
                            <div className="absolute inset-0 bg-white"></div>
                            <div className="relative p-12 md:p-20 text-center space-y-8 bg-gray-50/50 backdrop-blur-sm">
                                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">¿Administras más de 3 propiedades?</h2>
                                <p className="text-gray-500 max-w-xl mx-auto">
                                    Obtén acceso a nuestra cuenta corporativa con líneas de crédito, facturación mensual y manager dedicado.
                                </p>
                                <div className="pt-4">
                                    <a
                                        href="https://wa.me/573000000000?text=Hola,%20me%20interesa%20una%20cuenta%20corporativa%20para%20mis%20propiedades."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold text-sm tracking-[0.2em] uppercase rounded-xl transition-colors shadow-lg hover:shadow-gray-900/20"
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
