"use client";

import { useReadContract, useActiveAccount, useSendTransaction, ConnectButton, ThirdwebProvider } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { toUnits } from "thirdweb/utils";
import { client, chain, tokenContract, TARGET_WALLET_ADDRESS } from "@/lib/thirdweb";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// CONFIGURACIÓN DE BILLETERA FÁCIL (Email/Google)
const wallets = [
    inAppWallet({
        auth: {
            options: ["google", "email"],
        },
        // Esto activa la billetera inteligente que "regala" el gas inicial
        smartWallet: {
            chain: chain,
            sponsorGas: true, // <--- ¡ESTO ES LA CLAVE!
        },
    }),
];

// COMPONENTE INTERNO: USA LOS HOOKS (Consumidor)
function TerminalContent() {
    // MOCK ACCOUNT FOR TESTING ONLY
    const account = { address: "0x123...TEST_USER" } as any; // useActiveAccount();
    const [amount, setAmount] = useState("");
    const [serviceDetails, setServiceDetails] = useState("");
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState(""); // WhatsApp
    const [coords, setCoords] = useState<{ lat: number | null, lng: number | null }>({ lat: null, lng: null });
    const [gpsLoading, setGpsLoading] = useState(false);

    const { data: tokenName } = useReadContract({ contract: tokenContract, method: "function name() view returns (string)", params: [] });
    const { data: tokenSymbol } = useReadContract({ contract: tokenContract, method: "function symbol() view returns (string)", params: [] });
    const { data: balance } = useReadContract({
        contract: tokenContract,
        method: "function balanceOf(address) view returns (uint256)",
        params: ["0x123...TEST_USER"]
    });

    const handleGPS = () => {
        if (!navigator.geolocation) return alert("GPS no soportado");
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGpsLoading(false);
                // Optionally inverse geocode here if we had an API, but for now we trust the text + coords
                if (!location) setLocation(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
            },
            (err) => {
                console.error(err);
                alert("Error obteniendo ubicación. Por favor escríbela manual.");
                setGpsLoading(false);
            }
        );
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* NAVEGACIÓN */}
            <nav className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-10 bg-gradient-to-b from-yellow-400 to-yellow-700"></div>
                    <div>
                        <h1 className="text-xl font-bold tracking-widest text-white uppercase">Cartagena</h1>
                        <p className="text-[10px] text-yellow-500 tracking-[0.3em] uppercase italic">Concierge</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/business" className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-yellow-500 transition-colors font-bold">
                        Empresas
                    </Link>
                    <ConnectButton
                        client={client}
                        theme="dark"
                        chain={chain}
                        wallets={wallets}
                        connectButton={{ label: "Ingresar / Registrarse" }}
                    />
                </div>
            </nav >

            <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-16 mt-10 items-center">

                <div className="space-y-8">
                    <div className="inline-block px-4 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold tracking-widest uppercase">
                        Exclusive Access
                    </div>

                    <h1 className="text-5xl md:text-7xl font-light leading-tight">
                        Lujo sin <br />
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700">
                            Fronteras.
                        </span>
                    </h1>

                    <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800">
                        <p className="text-gray-500  text-xs uppercase tracking-[0.2em] mb-3">Tus Créditos VIP</p>
                        {account ? (
                            <div className="flex flex-col">
                                <span className="text-4xl font-mono font-bold text-white tracking-tighter">
                                    {(Number(balance) / 10 ** 18).toLocaleString()} <span className="text-yellow-500">{tokenSymbol}</span>
                                </span>
                                <span className="text-green-500 text-[10px] mt-2 uppercase tracking-widest font-bold">● Sesión Segura Iniciada</span>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm italic">Inicia sesión con tu correo para ver tu saldo</p>
                        )}
                    </div>
                </div>

                <div className="relative group">
                    <div className="relative bg-gray-900/90 border border-white/5 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                            <h3 className="text-xl font-medium text-white tracking-wide">Solicitar & Pagar</h3>
                        </div>

                        <div className="space-y-4">
                            {/* INPUT: DETALLES */}
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2 block font-bold">¿Qué necesitas?</label>
                                <textarea
                                    placeholder="Ej: Traer 200k en efectivo..."
                                    className="w-full bg-black/50 border border-white/10 text-white text-sm p-4 rounded-xl outline-none focus:border-yellow-500/50 transition-colors h-20 resize-none"
                                    value={serviceDetails}
                                    onChange={(e) => setServiceDetails(e.target.value)}
                                />
                            </div>

                            {/* INPUT: WHATSAPP */}
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2 block font-bold">Tu WhatsApp (Obligatorio)</label>
                                <input
                                    type="tel"
                                    placeholder="+57 300 000 0000"
                                    className="w-full bg-black/50 border border-white/10 text-white text-sm p-4 rounded-xl outline-none focus:border-yellow-500/50 transition-colors"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            {/* INPUT: UBICACIÓN + GPS */}
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2 block font-bold">¿A dónde vamos?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ej: Hotel Santa Clara, Hab 202"
                                        className="w-full bg-black/50 border border-white/10 text-white text-sm p-4 rounded-xl outline-none focus:border-yellow-500/50 transition-colors"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                    <button
                                        onClick={handleGPS}
                                        className="px-4 bg-gray-800 text-yellow-500 rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors"
                                        title="Usar mi ubicación actual"
                                    >
                                        {gpsLoading ? "..." : "📍"}
                                    </button>
                                </div>
                                {coords.lat && <p className="text-[10px] text-green-500 mt-1">GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>}
                            </div>

                            {/* INPUT: CREDITS */}
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2 block font-bold">Monto (Créditos)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-black/50 border border-white/10 text-white text-2xl p-4 rounded-xl outline-none focus:border-yellow-500/50 transition-colors font-mono"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-yellow-500 font-bold">CARTAGENA</div>
                                </div>
                            </div>

                            <TxButton
                                account={account}
                                amount={amount}
                                serviceDetails={serviceDetails}
                                location={location}
                                phone={phone}
                                coords={coords}
                                contract={tokenContract}
                                client={client}
                                balance={balance}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div >
    );
}

// Sub-component for clean transaction logic
function TxButton({ account, amount, serviceDetails, location, phone, coords, contract, client, balance }: any) {
    const { mutateAsync: sendTransaction, isPending } = useSendTransaction();
    const [status, setStatus] = useState("idle"); // idle, success, error
    const router = useRouter();

    const handleClick = async () => {
        if (!account) return alert("Inicia sesión");
        if (!amount || !serviceDetails || !location) return alert("Faltan datos");
        if (!phone) return alert("WhatsApp es obligatorio para contactarte");

        // Validation: Insufficient Balance
        const currentBalance = Number(balance) / 10 ** 18;
        if (Number(amount) > currentBalance) {
            alert(`❌ Saldo Insuficiente. Tienes ${currentBalance.toLocaleString()} créditos, pero intentas enviar ${Number(amount).toLocaleString()}.`);
            return;
        }

        try {
            setStatus("pending");

            // 1. Prepared Call
            // const transaction = prepareContractCall({
            //    contract,
            //    method: "function transfer(address to, uint256 value)",
            //    params: [TARGET_WALLET_ADDRESS, toUnits(amount, 18)],
            // });

            // 2. Execute on Blockchain
            // const { transactionHash } = await sendTransaction(transaction);
            const transactionHash = "0xMOCK_TRANSACTION_HASH_FOR_TESTING";
            await new Promise(r => setTimeout(r, 2000)); // Simulate delay

            // 3. Import dynamic action
            const { createWeb3Order } = await import("@/app/actions");

            // 4. Save to DB with Extra Data
            const result = await createWeb3Order(
                Number(amount),
                serviceDetails,
                location,
                transactionHash,
                phone,
                coords?.lat,
                coords?.lng
            );

            if (result.success) {
                setStatus("success");
                // alert("¡Orden Creada y Pagada! 🚀");
                router.push(`/order/${result.orderId}`);
            } else {
                setStatus("error");
                alert("Pago ok, pero error guardando orden: " + result.error);
            }

        } catch (e: any) {
            console.error(e);
            setStatus("error");
            alert("Error: " + e.message);
        } finally {
            if (status !== "success") setStatus("idle");
        }
    };

    return (
        <button
            className={`w-full py-5 rounded-xl font-bold text-sm uppercase tracking-[0.2em] transition-all shadow-lg 
            ${!account ? 'bg-gray-800 text-gray-500' : 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black hover:scale-[1.02]'}
            ${(isPending || status === 'pending') ? 'opacity-70 cursor-wait' : ''}
            `}
            onClick={handleClick}
            disabled={isPending || status === 'pending' || !account}
        >
            {!account ? "Inicia Sesión" : (isPending || status === 'pending') ? "Procesando..." : status === 'success' ? "¡Éxito!" : "Solicitar Servicio"}
        </button>
    )
}

// COMPONENTE PRINCIPAL: Wrapper con Provider
export default function ConciergeTerminal() {
    return (
        <ThirdwebProvider>
            <TerminalContent />
        </ThirdwebProvider>
    );
}
