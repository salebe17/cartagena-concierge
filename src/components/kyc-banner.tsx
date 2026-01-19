'use client'

import { AlertTriangle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

interface KYCBannerProps {
    status: string // 'unverified' | 'pending' | 'verified' | 'rejected'
}

export function KYCBanner({ status }: KYCBannerProps) {
    if (status === 'verified') return null

    const content = {
        unverified: {
            icon: AlertTriangle,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            title: 'Verificación Requerida',
            text: 'Necesitas verificar tu identidad para realizar pedidos.',
            action: { label: 'Verificar Ahora', href: '/verify' }
        },
        pending: {
            icon: Clock,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            title: 'Verificación en Proceso',
            text: 'Tus documentos están en revisión. Te avisaremos pronto.',
            action: null
        },
        rejected: {
            icon: ShieldAlert,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            title: 'Verificación Rechazada',
            text: 'Verificación rechazada. Por favor contacta soporte.',
            action: { label: 'Intentar de nuevo', href: '/verify' }
        }
    }

    const current = content[status as keyof typeof content] || content.unverified
    const Icon = current.icon

    return (
        <Card className={`mb-6 p-4 border ${current.bg} ${current.border}`}>
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full bg-black/20 ${current.color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold ${current.color}`}>{current.title}</h3>
                    <p className="text-sm text-zinc-300 mb-3">{current.text}</p>
                    {current.action && (
                        <Link href={current.action.href}>
                            <Button size="sm" className={`${current.color === 'text-yellow-500' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} text-white border-0`}>
                                {current.action.label}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </Card>
    )
}
