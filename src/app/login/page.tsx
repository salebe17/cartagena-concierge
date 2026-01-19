
import { AuthForm } from '@/components/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login | Cartagena Luxury Concierge',
    description: 'Exclusive access to premium cash delivery services.',
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F9FAFB] text-zinc-900">

            {/* Left Panel: Branding / Visuals */}
            <div className="hidden md:flex flex-col justify-between w-1/2 bg-black text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542259681-d41933c023d5?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-serif italic tracking-wide text-[#D4AF37]">Cartagena Concierge</h1>
                </div>

                <div className="relative z-10 space-y-6">
                    <h2 className="text-5xl font-bold leading-tight">
                        Privacy, Speed, <br /> and <span className="text-[#D4AF37]">Exclusivity.</span>
                    </h2>
                    <p className="text-lg text-zinc-300 max-w-md">
                        Experience the ultimate convenience. Secure cash delivery to your villa, yacht, or hotel suite in minutes.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-zinc-500 uppercase tracking-widest">
                    © 2026 Cartagena Luxury Services
                </div>
            </div>

            {/* Right Panel: Auth Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center md:text-left space-y-2">
                        <h3 className="text-2xl font-semibold text-zinc-900">Member Access</h3>
                        <p className="text-zinc-500 text-sm">Please identify yourself to continue.</p>
                    </div>

                    <AuthForm />
                </div>
            </div>

        </div>
    )
}
