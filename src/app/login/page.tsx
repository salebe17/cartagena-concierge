
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
            <div className="hidden md:flex flex-col justify-between w-1/2 relative overflow-hidden bg-zinc-950">
                {/* Tech / City image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50 grayscale transition-all duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>

                <div className="relative z-10 p-12">
                    <span className="text-white font-black text-2xl tracking-tighter">cartagena<span className="text-[var(--color-primary)] font-bold">services</span></span>
                </div>

                <div className="relative z-10 p-12 space-y-4">
                    <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
                        Ponle precio <br /> a tus servicios.
                    </h2>
                    <p className="text-lg text-white/70 font-medium max-w-md leading-relaxed">
                        El primer mercado bidireccional de Cartagena. Técnicos y clientes acuerdan el precio justo en tiempo real.
                    </p>
                </div>

                <div className="relative z-10 p-12 text-xs text-white/50 font-bold uppercase tracking-widest flex justify-between items-center">
                    <span>© 2026 Cartagena Services</span>
                    <span className="text-[var(--color-primary)]">inDriver Platform</span>
                </div>
            </div>

            {/* Right Panel: Auth Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative bg-white">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center md:text-left space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenido de nuevo</h3>
                        <p className="text-gray-500 text-sm font-medium">Ingresa para acceder al Radar o al Portal de Cliente.</p>
                    </div>

                    <AuthForm />
                </div>
            </div>

        </div>
    )
}
