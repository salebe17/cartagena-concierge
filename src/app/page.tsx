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
          The <span className="text-[var(--color-primary)]">inDriver</span> for<br />Home Services
        </h1>

        <p className="text-xl text-[var(--color-text-secondary)] mb-12 max-w-xl mx-auto">
          Name your price for maintenance, cleaning, or concierge services. Technicians bid in real-time.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Client Portal Button */}
          <Link href="/client/dashboard" className="group">
            <div className="glass p-8 rounded-3xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:-translate-y-1 relative overflow-hidden flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 text-white shadow-xl">
                <UserRound size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">I need a Service</h2>
              <p className="text-[var(--color-text-secondary)] mb-6">Post a job, set your price, and get offers instantly.</p>
              <div className="flex items-center text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform">
                Enter as Client <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </Link>

          {/* Technician Portal Button */}
          <Link href="/technician/dashboard" className="group">
            <div className="glass p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:-translate-y-1 relative overflow-hidden flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 text-white shadow-xl">
                <Wrench size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">I am a Technician</h2>
              <p className="text-[var(--color-text-secondary)] mb-6">Find jobs nearby on the radar and bid to earn money.</p>
              <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                Enter Gig Radar <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
