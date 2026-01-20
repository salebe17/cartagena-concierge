import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HeroAnimation from '@/components/HeroAnimation'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()

  // Check Auth
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 md:p-20 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[#0a0a0a]"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10 w-full">

        {/* Animation Column (Top on Mobile, Right on Desktop) */}
        <div className="order-1 md:order-2 flex justify-center w-full">
          <HeroAnimation />
        </div>

        {/* Text Column (Bottom on Mobile, Left on Desktop) */}
        <div className="order-2 md:order-1 text-center md:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase border border-[#D4AF37]/20 mx-auto md:mx-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Cartagena Concierge
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-serif leading-[1.1] tracking-tight">
            Premium <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37]">Logistics</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-md mx-auto md:mx-0 leading-relaxed font-light">
            Privacy, Speed, and Exclusivity. <br />
            Premium lifestyle logistics for your villa, yacht, or hotel suite in minutes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full max-w-md mx-auto md:mx-0">
            <Button asChild className="h-14 px-8 text-lg font-bold bg-[#D4AF37] text-black hover:bg-[#b5952f] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex-1">
              <Link href="/login">
                Member Access
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 px-8 text-lg font-bold border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full flex-1 hover:border-zinc-700">
              <Link href="/login">
                Login
              </Link>
            </Button>
          </div>

          <p className="text-zinc-600 text-xs uppercase tracking-widest pt-8">
            Secure • Discrete • 24/7
          </p>
        </div>

      </div>
    </div>
  )
}
