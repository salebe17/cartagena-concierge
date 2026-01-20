import Link from "next/link";
import HeroAnimation from "@/components/HeroAnimation"; // <--- ¡Importante!

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white">

      {/* HEADER SIMPLE */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tighter">
            CARTAGENA <span className="text-indigo-500">CONCIERGE</span>
          </span>
          <Link href="/login" className="px-4 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-gray-200 transition">
            Member Login
          </Link>
        </div>
      </header>

      {/* --- AQUÍ ESTÁ LA MOTO (HERO SECTION) --- */}
      <section className="relative pt-32 pb-20 overflow-hidden px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-900/40 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* LADO IZQUIERDO: TEXTO */}
          <div className="text-center md:text-left z-10">
            <div className="inline-block px-4 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-6">
              Web3 Logistics Network
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Exclusive <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Concierge Delivery</span>
            </h1>
            <p className="mt-4 text-xl text-slate-400 leading-relaxed">
              Secure, discreet, and instant delivery of essentials to your hotel, villa, or yacht in Cartagena.
            </p>
            <div className="mt-8 flex justify-center md:justify-start">
              <Link href="/login" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shadow-lg shadow-indigo-500/20 w-full md:w-auto">
                Request Service
              </Link>
            </div>
          </div>

          {/* LADO DERECHO: LA MOTO ANIMADA */}
          <div className="relative flex justify-center md:justify-end">
            {/* Brillo detrás de la moto */}
            <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full"></div>
            <HeroAnimation />
          </div>

        </div>
      </section>

    </div>
  );
}
