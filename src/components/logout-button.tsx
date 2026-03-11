'use client'

import { useState } from 'react'
import { signOut } from '@/app/actions/dashboard'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export function LogoutButton() {
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        setLoading(true)
        try {
            // 1. Destroy local Capacitor/Browser JWT session first
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )
            await supabase.auth.signOut()
            
            // 2. Destroy Next.js Edge Server Cookies
            await signOut()
        } catch (error) {
            console.error("Logout failed", error)
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10 gap-3 rounded-xl transition-all"
            onClick={handleLogout}
            disabled={loading}
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            <span className="font-medium">Cerrar Sesión</span>
        </Button>
    )
}
