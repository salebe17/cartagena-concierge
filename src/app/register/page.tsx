import { AuthForm } from '@/components/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Registrar Propiedad | Cartagena Concierge',
    description: 'Únete a la red más exclusiva de anfitriones.',
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">

            {/* Left Panel: High Key Visuals (Cartagena) */}
            <div className="hidden md:flex flex-col justify-between w-1/2 relative overflow-hidden bg-gray-900">
                {/* Visual: Evening/Luxury Vibe for Register */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573059223321-4ba2b0e69888?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>

                <div className="relative z-10 p-12">
                    <span className="text-white font-black text-2xl tracking-tighter">cartagena<span className="opacity-80 font-normal">concierge</span></span>
                </div>

                <div className="relative z-10 p-12 space-y-4">
                    <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
                        Bienvenido al <br /> <span className="text-[#FF5A5F]">Club</span>.
                    </h2>
                    <p className="text-lg text-white/90 font-medium max-w-md leading-relaxed">
                        Estás a un paso de automatizar tu propiedad. Únete a los anfitriones que recuperaron su tiempo libre.
                    </p>
                </div>

                <div className="relative z-10 p-12 text-xs text-white/70 font-bold uppercase tracking-widest flex justify-between items-center">
                    <span>© 2026 Cartagena Concierge</span>
                    <span>Members Only</span>
                </div>
            </div>

            {/* Right Panel: Auth Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative bg-white">
                <div className="absolute top-8 left-8 md:hidden">
                    <span className="font-black text-xl tracking-tighter text-gray-900">cartagena<span className="opacity-80 font-normal">concierge</span></span>
                </div>

                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center md:text-left space-y-2">
                        <div className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest mb-2 border border-rose-100">
                            Registro Gratuito
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Crea tu cuenta</h3>
                        <p className="text-gray-500 text-sm font-medium">Ingresa tu correo para comenzar el onboarding.</p>
                    </div>

                    <AuthForm />

                    <p className="text-center text-xs text-gray-400 mt-8">
                        Al continuar, aceptas nuestros <a href="#" className="underline hover:text-gray-900">Términos de Servicio</a> y <a href="#" className="underline hover:text-gray-900">Política de Privacidad</a>.
                    </p>
                </div>
            </div>

        </div>
    )
}
