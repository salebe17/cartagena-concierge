import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ShieldCheck, Clock, Globe } from "lucide-react";
import { LayoutDebugWidget } from "@/components/LayoutDebugWidget";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#FF5A5F] selection:text-white">

      {/* HERO SECTION */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 lg:pt-48 lg:pb-32 text-center lg:text-left">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Operador Certificado Cartagena</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight text-gray-900">
                Logística de Lujo para tu <span className="text-[#FF5A5F]">Airbnb</span>.
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Elevamos tu propiedad con limpieza de hotel 5 estrellas, mantenimiento preventivo y reportes fotográficos en tiempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button className="h-14 px-8 text-lg rounded-xl bg-[#FF5A5F] hover:bg-[#E03E43] text-white shadow-hero w-full sm:w-auto">
                    Ingresar a Plataforma
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="h-14 px-8 text-lg rounded-xl border-gray-200 hover:bg-gray-50 text-gray-900 w-full sm:w-auto">
                    Registrar Propiedad
                  </Button>
                </Link>
              </div>
              <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Compatible con:</p>
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" alt="Airbnb" className="h-8" />
                {/* Add more logos if needed */}
              </div>
            </div>
            <div className="relative group hidden lg:block h-[600px] w-full">
              {/* Background Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-100 to-teal-100 rounded-[2.5rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-700" />

              {/* Main Image - Stable & Premium */}
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-[1px] border-white/50">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-e328d4de4bf7?q=80&w=2000&auto=format&fit=crop"
                  alt="Luxury Interior"
                  className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />

                {/* Floating Card - Glassmorphism */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/40 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 delay-300 duration-1000">
                  <div className="w-12 h-12 bg-emerald-100/80 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 leading-tight">Limpieza Verificada</p>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">Hace 2 minutos • Bocagrande</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900">¿Por qué los Superhosts nos eligen?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Dejamos de lado el caos operativo. Te damos control total con tecnología transparente.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Star className="text-amber-500" />}
              title="Estándar Hotelero"
              desc="Nuestro personal sigue un checklist de 40 puntos. Sábanas perfectas, baños impolutos y amenidades repuestas."
            />
            <FeatureCard
              icon={<Clock className="text-blue-500" />}
              title="Turnover Express"
              desc="Coordinamos limpiezas sincronizadas con tu calendario iCal. Tu propiedad siempre lista para el check-in de las 3 PM."
            />
            <FeatureCard
              icon={<Globe className="text-emerald-500" />}
              title="Reporte en Tiempo Real"
              desc="Recibe fotos antes y después de cada servicio directamente en tu dashboard. Sin sorpresas."
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl font-black text-gray-900">Recupera tu tiempo.</h2>
          <p className="text-xl text-gray-500">Únete a la red de propietarios más exclusiva de Cartagena.</p>
          <Link href="/register">
            <Button className="h-16 px-12 text-xl rounded-full bg-black hover:bg-gray-800 text-white shadow-xl transition-all hover:scale-105 active:scale-95">
              Comenzar Ahora <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <LayoutDebugWidget />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
