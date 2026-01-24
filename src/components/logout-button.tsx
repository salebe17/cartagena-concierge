'use client'

import { signOut } from '@/app/actions/dashboard'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
    return (
        <form action={() => signOut()}>
            <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-white/10 gap-2"
                type="submit"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Salir</span>
            </Button>
        </form>
    )
}
