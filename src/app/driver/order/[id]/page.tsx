'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getOrder, completeOrder, verifyDelivery } from '@/app/actions'
import { MapPin, Navigation, CheckCircle, MessageCircle, Lock } from 'lucide-react'

// Simple button component for consistency
const ActionButton = ({ onClick, color, icon: Icon, label, disabled }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all active:scale-95 ${disabled ? 'bg-gray-300' : color
            }`}
    >
        {Icon && <Icon size={20} />}
        {label}
    </button>
)

export default function DriverOrderPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState<'details' | 'signature'>('details') // Keeping 'signature' as step name for minimal refactoring impact, or rename to 'verify'
    const [pin, setPin] = useState('')

    useEffect(() => {
        async function load() {
            if (!params.id) return
            const { data } = await getOrder(params.id as string)
            setOrder(data)
            setLoading(false)
        }
        load()
    }, [params.id])

    const handleOpenWaze = () => {
        if (!order) return
        // Use stored coordinates or fallback to Cartagena default
        const lat = order.location_lat || 10.391
        const lng = order.location_lng || -75.479
        window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank')
    }

    const handleOpenMaps = () => {
        if (!order) return
        const lat = order.location_lat || 10.391
        const lng = order.location_lng || -75.479
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
    }

    const handleComplete = async () => {
        if (!pin || pin.length < 4) return alert('Ingresa el código de seguridad de 4 dígitos')

        try {
            await verifyDelivery(order.id, pin)
            router.push('/driver') // Back to list
        } catch (error: any) {
            alert(error.message || 'Error al verificar la entrega')
        }
    }

    if (loading) return <div className="p-10 text-center">Cargando orden...</div>
    if (!order) return <div className="p-10 text-center">Orden no encontrada</div>

    return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                            {order.status}
                        </span>
                        <h1 className="text-3xl font-black mt-2">${Number(order.amount).toLocaleString()}</h1>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        #{order.id.slice(0, 4)}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <MapPin size={18} />
                    <span className="text-sm font-medium">Distancia: {order.distance_km || 5} km</span>
                </div>
            </div>

            {/* Navigation Actions */}
            {step === 'details' && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Navegación</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <ActionButton
                            onClick={handleOpenWaze}
                            color="bg-blue-500 hover:bg-blue-600"
                            icon={Navigation}
                            label="Waze"
                        />
                        <ActionButton
                            onClick={handleOpenMaps}
                            color="bg-green-500 hover:bg-green-600"
                            icon={MapPin}
                            label="Maps"
                        />
                    </div>
                    {/* WhatsApp Button */}
                    <ActionButton
                        onClick={() => {
                            // Prioritize order-specific phone, then fallback to profile, then generic
                            const phone = order.client_phone || order.client?.phone || '573000000000'
                            const text = `Hola, soy tu conductor de Cartagena Concierge. Voy en camino.`
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
                        }}
                        color="bg-emerald-500 hover:bg-emerald-600"
                        // Using a simple text label or importing a MessageCircle/Phone icon if available
                        // We'll use MapPin as placeholder or add MessageCircle icon import
                        icon={MessageCircle}
                        label="WhatsApp Client"
                        disabled={!order.client_phone && !order.client?.phone} // Optional: Disable if no phone found at all, or leave enabled with fallback
                    />

                    <div className="h-4"></div> {/* Spacer */}

                    <ActionButton
                        onClick={() => setStep('signature')}
                        color="bg-black hover:bg-zinc-800"
                        label="Finalizar Entrega"
                        icon={CheckCircle}
                    />
                </div>
            )}

            {/* PIN Verification Step */}
            {step === 'pin' && (
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-300 text-center space-y-6">

                        {/* Security PIN Input */}
                        <div className="space-y-4">
                            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Lock className="text-emerald-600 w-8 h-8" />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-2">Código de Seguridad</label>
                                <p className="text-xs text-gray-400 mb-4">Pídele el código de 4 dígitos al cliente para finalizar.</p>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="0000"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-48 text-center text-4xl font-mono font-bold border-b-2 border-gray-300 focus:border-black outline-none bg-transparent tracking-[0.4em] placeholder-gray-200 py-2"
                                />
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setStep('details')} className="text-gray-500 font-medium">Cancelar</button>
                        <ActionButton
                            onClick={handleComplete}
                            color="bg-black"
                            label="Verificar y Finalizar"
                            disabled={pin.length < 4}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
