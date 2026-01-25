import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ShieldCheck, Clock, Globe, Award, CheckCircle } from "lucide-react";
import { LayoutDebugWidget } from "@/components/LayoutDebugWidget";
import { HeroRegistrationWidget } from "@/components/HeroRegistrationWidget";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* HEADER (Minimalist Airbnb Style) */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF385C] rounded-full flex items-center justify-center text-white">
              <ShieldCheck size={18} fill="currentColor" className="text-white" />
            </div>
            <span className="font-extrabold text-[#FF385C] tracking-tighter text-xl hidden sm:block">concierge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-full transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-gray-900 hover:bg-black text-white px-6 font-bold text-sm h-10 shadow-none">
                Registra tu Propiedad
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="pt-20">
        <div className="relative">
          {/* Split Background on Large Screens */}
          <div className="absolute inset-0 grid lg:grid-cols-2">
            <div className="hidden lg:block bg-white" />
            <div className="bg-gray-100" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="grid lg:grid-cols-2 min-h-[calc(100vh-80px)] items-center gap-12 lg:gap-24 py-12 lg:py-0">

              {/* Left Column: Copy & Widget */}
              <div className="space-y-8 animate-in fade-in slide-in-from-left-5 duration-700">
                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                    Pon tu Airbnb en <span className="text-[#FF385C]">Autopiloto</span>.
                  </h1>
                  <p className="text-lg text-gray-500 font-medium max-w-md leading-relaxed">
                    La infraestructura operativa que usan los Superhosts en Cartagena. Limpieza, mantenimiento y recepción 5 estrellas.
                  </p>
                </div>

                {/* WIDGET INTEGRATION */}
                <div className="max-w-md">
                  <HeroRegistrationWidget />
                </div>

                <div className="flex items-center gap-4 pt-4 opacity-70">
                  <Star size={16} className="text-[#FF385C] fill-current" />
                  <span className="text-sm font-semibold text-gray-900">4.9/5 Calificación Promedio</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">+500 Reservas Gestionadas</span>
                </div>
              </div>

              {/* Right Column: Hero Image (Clean / No Skew) */}
              <div className="relative h-[500px] lg:h-[700px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2000&auto=format&fit=crop"
                  alt="Vista privilegiada en Cartagena"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
                />
                {/* NO FLOATING CARD AS REQUESTED */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES (Airbnb Category Style) */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-12">Todo lo que necesitas para ser Superhost</h2>
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            <FeatureCard
              title="Limpieza Hotelera"
              desc="Protocolos de 40 puntos. Ropa de cama blanca, amenities de lujo y limpieza profunda entre cada estancia."
              img="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop"
            />
            <FeatureCard
              title="Mantenimiento 24/7"
              desc="Desde un aire acondicionado dañado hasta una bombilla fundida. Lo solucionamos antes de que el huésped lo note."
              img="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop"
            />
            <FeatureCard
              title="Concierge VIP"
              desc="Recepción de huéspedes, transporte privado y experiencias locales. Tus huéspedes amarán su estancia."
              img="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop"
            />
          </div>
        </div>
      </div>

      {/* TRUST BANNER */}
      <div className="bg-gray-50 py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Tecnología Transparente</h3>
            <p className="text-gray-500">
              Usa nuestro Dashboard para ver fotos en tiempo real de cada limpieza y mantenimiento.
              Tu propiedad en tu bolsillo.
            </p>
          </div>
          <Link href="/register">
            <Button variant="outline" className="h-12 px-8 rounded-xl border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold transition-colors">
              Ver Demo del Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <LayoutDebugWidget />
    </div>
  );
}

function FeatureCard({ title, desc, img }: { title: string, desc: string, img: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-100">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:underline decoration-2 decoration-gray-200 underline-offset-4">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
