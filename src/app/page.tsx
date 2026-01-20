"use client";

import { ThirdwebProvider, ConnectButton, useReadContract, useActiveAccount, useSendTransaction } from "thirdweb/react";
import { createThirdwebClient, getContract, defineChain, prepareContractCall } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { useState } from "react";

// 1. CONFIGURACIÓN DEL CLIENTE (Tu ID ya está puesto)
const client = createThirdwebClient({
  clientId: "63857cb90adaf65ae3dde1e59baba96a",
});

// 2. CONECTAMOS CON LA RED AMOY
const chain = defineChain(80002);

// 3. CONECTAMOS CON TU CONTRATO "CARTAGENA CREDITS"
const contract = getContract({
  client,
  chain,
  address: "0x7b9a5cE25723936F5D26A5caA18EB15ad08aA935",
});

export default function Home() {
  const account = useActiveAccount();
  const [amount, setAmount] = useState("");
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  // LEER DATOS DEL TOKEN DESDE LA BLOCKCHAIN
  const { data: tokenName } = useReadContract({ contract, method: "function name() view returns (string)", params: [] });
  const { data: tokenSymbol } = useReadContract({ contract, method: "function symbol() view returns (string)", params: [] });

  // LEER SALDO DEL USUARIO CONECTADO
  const { data: balance } = useReadContract({
    contract,
    method: "function balanceOf(address) view returns (uint256)",
    params: [account?.address || "0x0000000000000000000000000000000000000000"]
  });

  // FUNCIÓN PARA ENVIAR PAGOS
  const handlePayment = () => {
    if (!amount || !account) return;

    // Dirección de la "Bóveda" (Puedes poner tu propia wallet aquí para probar)
    const receiverAddress = "0x53502758255955178A3266847849925232824330";

    const transaction = prepareContractCall({
      contract,
      method: "function transfer(address to, uint256 value)",
      params: [receiverAddress, toUnits(amount, 18)],
    });

    sendTransaction(transaction);
  };

  return (
    <ThirdwebProvider>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">

        {/* BARRA DE NAVEGACIÓN */}
        <nav className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-10 bg-gradient-to-b from-yellow-400 to-yellow-700"></div>
            <div>
              <h1 className="text-xl font-bold tracking-widest text-white uppercase">Cartagena</h1>
              <p className="text-xs text-yellow-500 tracking-[0.3em] uppercase italic">Concierge</p>
            </div>
          </div>
          <ConnectButton client={client} theme="dark" chain={chain} />
        </nav>

        <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-16 mt-10 items-center">

          {/* SECCIÓN IZQUIERDA: SALDOS */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold tracking-widest uppercase">
              Blockchain Verified
            </div>

            <h1 className="text-5xl md:text-7xl font-light leading-tight">
              Vive la <br />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700">
                Exclusividad.
              </span>
            </h1>

            <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 shadow-xl">
              <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-3">Balance en {tokenName || "Cargando..."}</p>
              {account ? (
                <div className="flex flex-col">
                  <span className="text-4xl font-mono font-bold text-white tracking-tighter">
                    {(Number(balance) / 10 ** 18).toLocaleString()} <span className="text-yellow-500">{tokenSymbol}</span>
                  </span>
                  <span className="text-green-500 text-[10px] mt-2 uppercase tracking-widest font-bold">● Billetera Administradora Activa</span>
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic italic">Conecta tu wallet para ver tus créditos VIP</p>
              )}
            </div>
          </div>

          {/* SECCIÓN DERECHA: TERMINAL DE PAGO */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-yellow-900 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-gray-900/90 border border-white/5 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">

              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h3 className="text-xl font-medium text-white tracking-wide">Pagar Servicio</h3>
                <span className="text-[10px] text-yellow-600 bg-yellow-600/10 px-2 py-1 rounded uppercase font-bold tracking-widest border border-yellow-600/20">Secure Pay</span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2 block font-bold">Cantidad de {tokenSymbol}</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-black/50 border border-white/5 text-white text-4xl p-5 rounded-xl focus:border-yellow-500 outline-none font-mono transition-all"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <button
                  className={`w-full py-5 rounded-xl font-bold text-sm uppercase tracking-[0.2em] flex justify-center items-center gap-3 transition-all duration-500 shadow-lg ${isPending ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black hover:scale-[1.02] hover:shadow-yellow-500/20'}`}
                  onClick={handlePayment}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4"></span>
                      Procesando...
                    </>
                  ) : `Confirmar Pago de ${amount || "0"} ${tokenSymbol}`}
                </button>
              </div>

              <p className="mt-8 text-[10px] text-center text-gray-600 uppercase tracking-widest font-medium">
                Protected by {tokenName} Smart Contract
              </p>
            </div>
          </div>

        </main>
      </div>
    </ThirdwebProvider>
  );
}
