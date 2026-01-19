import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                <AlertCircle className="w-12 h-12 text-[#D4AF37]" />
            </div>

            <h1 className="text-4xl font-serif font-bold text-white mb-2">404</h1>
            <h2 className="text-xl font-medium text-zinc-400 mb-6">Página No Encontrada</h2>

            <p className="text-zinc-500 max-w-sm mb-8">
                La ruta que buscas no existe o ha sido movida. Regresa a la zona segura.
            </p>

            <Button asChild className="bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold h-12 px-8 rounded-full">
                <Link href="/dashboard">
                    Regresar al Dashboard
                </Link>
            </Button>
        </div>
    )
}
