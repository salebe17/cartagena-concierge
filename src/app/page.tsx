import Link from "next/link";
import { ArrowRight, Wrench, UserRound } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] font-sans text-white relative flex flex-col items-center justify-center overflow-hidden">

      {/* Background Effect for AAA aesthetic */}
      <div className="w-full absolute inset-0 h-screen z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black">
      </div>

      <div className="z-10 text-center max-w-3xl px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-medium text-sm mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Cartagena Services 2.0
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-glow leading-tight">
          El <span className="text-[var(--color-primary)]">inDriver</span> de los<br />Servicios para el Hogar
        </h1>

        <p className="text-xl text-[var(--color-text-secondary)] mb-12 max-w-xl mx-auto">
          Ponle precio a los servicios de mantenimiento, limpieza o concierge. Los técnicos publican sus ofertas en tiempo real.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Client Portal Button */}
          <Link href="/client/dashboard" className="group">
            <div className="glass p-8 rounded-3xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:-translate-y-1 relative overflow-hidden flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 text-white shadow-xl">
                <UserRound size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Necesito un Servicio</h2>
              <p className="text-[var(--color-text-secondary)] mb-6">Publica una solicitud, ponle precio y recibe ofertas al instante.</p>
              <div className="flex items-center text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform">
                Entrar como Cliente <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </Link>

          {/* Technician Portal Button */}
          <Link href="/technician/dashboard" className="group">
            <div className="glass p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:-translate-y-1 relative overflow-hidden flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 text-white shadow-xl">
                <Wrench size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Soy un Técnico</h2>
              <p className="text-[var(--color-text-secondary)] mb-6">Encuentra trabajos cercanos en el radar y oferta para ganar dinero.</p>
              <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                Entrar al Radar de Trabajos <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
