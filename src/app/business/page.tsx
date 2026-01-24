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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-1 h-8 bg-yellow-500"></div>
                        <div>
                            <h1 className="text-lg font-bold tracking-widest text-white uppercase">Cartagena</h1>
                            <p className="text-[9px] text-yellow-500 tracking-[0.3em] uppercase italic">Business</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/" className="hidden md:flex text-xs uppercase tracking-widest hover:text-yellow-500 transition-colors items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </Link>
                    <ConnectButton
                        client={client}
                        chain={chain}
                        wallets={wallets}
                        theme="dark"
                        connectButton={{
                            label: "Ingresar / Registro",
                            className: "!bg-yellow-600 !text-black !font-bold !uppercase !tracking-wider !text-xs !rounded-lg"
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
                        <div className="text-center mb-24 space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
                            <div className="inline-block px-4 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold tracking-widest uppercase mb-4">
                                Para Anfitriones & Empresas
                            </div>
                            <h1 className="text-5xl md:text-7xl font-light leading-tight">
                                Eleva tu <br />
                                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700">
                                    Estándar.
                                </span>
                            </h1>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
                                Soluciones logísticas de alta gama para administradores de propiedades, Airbnb y hoteles boutique.
                                Delega la operatividad, nosotros nos encargamos de la excelencia.
                            </p>
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 animate-in fade-in zoom-in duration-700 delay-150">
                            {/* Card 1 */}
                            <div className="group bg-gray-900/50 hover:bg-gray-900 border border-white/5 hover:border-yellow-500/30 p-8 rounded-2xl transition-all duration-500">
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Key className="w-6 h-6 text-yellow-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide text-white">Guest Experience</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Kits de bienvenida premium, check-ins VIP y atención 24/7 para tus huéspedes más exigentes.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="group bg-gray-900/50 hover:bg-gray-900 border border-white/5 hover:border-yellow-500/30 p-8 rounded-2xl transition-all duration-500">
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Truck className="w-6 h-6 text-yellow-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide text-white">Logística & Insumos</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Restocking automático de amenities, entregas de emergencia y gestión de compras grandes.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="group bg-gray-900/50 hover:bg-gray-900 border border-white/5 hover:border-yellow-500/30 p-8 rounded-2xl transition-all duration-500">
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-6 h-6 text-yellow-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-wide text-white">Mantenimiento Exprés</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Plomería, aire acondicionado y reparaciones urgentes en menos de 2 horas.
                                </p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/20 to-black pointer-events-none"></div>
                            <div className="relative p-12 md:p-20 text-center space-y-8 bg-gray-900/40 backdrop-blur-sm">
                                <Building2 className="w-16 h-16 text-yellow-500 mx-auto opacity-50 mb-4" />
                                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">¿Administras más de 3 propiedades?</h2>
                                <p className="text-gray-400 max-w-xl mx-auto">
                                    Obtén acceso a nuestra cuenta corporativa con líneas de crédito, facturación mensual y manager dedicado.
                                </p>
                                <div className="pt-4">
                                    <a
                                        href="https://wa.me/573000000000?text=Hola,%20me%20interesa%20una%20cuenta%20corporativa%20para%20mis%20propiedades."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm tracking-[0.2em] uppercase rounded-xl transition-colors shadow-lg hover:shadow-yellow-500/20"
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
