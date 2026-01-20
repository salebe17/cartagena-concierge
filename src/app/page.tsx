import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HeroAnimation from "@/components/HeroAnimation";

export default async function Home() {
  const supabase = await createClient()

  // Check Auth
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-900/40 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">

            {/* COLUMNA IZQUIERDA: Texto de Venta (Compliance Friendly) */}
            <div className="flex-1 text-center md:text-left z-10">
              <div className="inline-block px-4 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-6">
                Web3 Logistics
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                Exclusive <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Concierge Delivery</span>
              </h1>
              <p className="mt-4 text-xl text-slate-400 leading-relaxed max-w-lg mx-auto md:mx-0">
                Secure, discreet, and instant delivery of essentials to your hotel, villa, or yacht in Cartagena.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/login" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shadow-lg shadow-indigo-500/20">
                  Request Service
                </Link>
                <a href="#how-it-works" className="px-8 py-4 bg-slate-800 text-white font-medium rounded-lg border border-slate-700 hover:bg-slate-700 transition">
                  How it works
                </a>
              </div>
            </div>

            {/* COLUMNA DERECHA: ¡LA MOTO! 🛵 */}
            <div className="flex-1 w-full flex justify-center md:justify-end relative">
              {/* Un brillo extra detrás de la moto para que resalte */}
              <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full"></div>
              <HeroAnimation />
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
