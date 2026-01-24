
import { AuthForm } from '@/components/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Ingresar | Cartagena Concierge',
    description: 'Gestiona tu propiedad con tranquilidad.',
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">

            {/* Left Panel: High Key Visuals (Cartagena) */}
            <div className="hidden md:flex flex-col justify-between w-1/2 relative overflow-hidden bg-[#FF5A5F]">
                {/* Bright, sunny Cartagena image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#FF5A5F]/90 to-transparent"></div>

                <div className="relative z-10 p-12">
                    <span className="text-white font-black text-2xl tracking-tighter">cartagena<span className="opacity-80 font-normal">concierge</span></span>
                </div>

                <div className="relative z-10 p-12 space-y-4">
                    <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
                        Gestiona tu propiedad <br /> con tranquilidad.
                    </h2>
                    <p className="text-lg text-white/90 font-medium max-w-md leading-relaxed">
                        La plataforma todo en uno para anfitriones de alta gama. Limpieza, mantenimiento y logística en un solo lugar.
                    </p>
                </div>

                <div className="relative z-10 p-12 text-xs text-white/70 font-bold uppercase tracking-widest flex justify-between items-center">
                    <span>© 2026 Cartagena Concierge</span>
                    <span>Handcrafted for Hosts</span>
                </div>
            </div>

            {/* Right Panel: Auth Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative bg-white">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center md:text-left space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenido de nuevo</h3>
                        <p className="text-gray-500 text-sm font-medium">Ingresa tus datos para acceder al panel de control.</p>
                    </div>

                    <AuthForm />
                </div>
            </div>

        </div>
    )
}
