'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getOrder, completeOrder, verifyDelivery } from '@/app/actions'
import { MapPin, Navigation, CheckCircle, MessageCircle, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Update ActionButton to handle loading
const ActionButton = ({ onClick, color, icon: Icon, label, disabled, loading }: any) => (
    <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all active:scale-95 ${disabled || loading ? 'bg-zinc-700 cursor-not-allowed' : color
            }`}
    >
        {loading ? <span className="animate-spin">🔄</span> : (Icon && <Icon size={20} />)}
        {label}
    </button>
)

export default function DriverOrderPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()
    const [submitting, setSubmitting] = useState(false)
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
        if (!pin || pin.length < 4) {
            toast({ title: "❌ Error", description: "Ingresa el código de 4 dígitos", variant: "destructive" })
            return
        }

        setSubmitting(true)
        const result = await verifyDelivery(order.id, pin)
        setSubmitting(false)

        if (!result.success) {
            toast({ title: "❌ Error", description: result.message, variant: "destructive" })
            setPin('') // Clear input on error
        } else {
            toast({ title: "✅ Éxito", description: "Entrega completada correctamente." })
            router.push('/driver')
        }
    }

    const handleUpdateStatus = async (newStatus: string) => {
        setSubmitting(true)
        // Import dynamic action here or at top
        const { updateOrderStatus } = await import('@/app/actions')
        const result = await updateOrderStatus(order.id, newStatus)
        setSubmitting(false)

        if (result.success) {
            toast({ title: "✅ Estado Actualizado", description: `Orden pasa a: ${newStatus}` })
            // Refresh local state roughly (revalidation handles real refresh)
            setOrder((prev: any) => ({ ...prev, status: newStatus }))
        } else {
            toast({ title: "❌ Error", description: result.error, variant: "destructive" })
        }
    }

    if (loading) return <div className="p-10 text-center">Cargando orden...</div>
    if (!order) return <div className="p-10 text-center">Orden no encontrada</div>

    // STATUS BASED ACTIONS
    const isUnassigned = order.status === 'paid' || order.status === 'pending'
    const isAssigned = order.status === 'assigned'
    const isInTransit = order.status === 'in_transit'

    return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide
                            ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'}`}>
                            {order.status.replace('_', ' ')}
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
                        const phone = order.client_phone || order.client?.phone || '573000000000'
                        const text = `Hola, soy tu conductor de Cartagena Concierge. Voy en camino.`
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
                    }}
                    color="bg-emerald-500 hover:bg-emerald-600"
                    icon={MessageCircle}
                    label="WhatsApp Client"
                    disabled={!order.client_phone && !order.client?.phone}
                />

                <div className="h-4"></div> {/* Spacer */}

                {/* DYNAMIC ACTION BUTTONS */}
                {isUnassigned && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-4">
                        <p className="text-sm text-yellow-800 mb-2 font-bold text-center">¿Aceptas esta orden?</p>
                        <ActionButton
                            onClick={() => handleUpdateStatus('assigned')}
                            color="bg-black hover:bg-zinc-800"
                            label={submitting ? "Procesando..." : "ACEPTAR VIAJE"}
                            icon={CheckCircle}
                            loading={submitting}
                        />
                    </div>
                )}

                {isAssigned && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                        <p className="text-sm text-blue-800 mb-2 font-bold text-center">¿Ya vas saliendo?</p>
                        <ActionButton
                            onClick={() => handleUpdateStatus('in_transit')}
                            color="bg-blue-600 hover:bg-blue-700"
                            label={submitting ? "Procesando..." : "VOY EN CAMINO 🚗"}
                            icon={Navigation}
                            loading={submitting}
                        />
                    </div>
                )}


                {/* PIN Input Section - Only when IN TRANSIT */}
                {isInTransit && (
                    <>
                        <div className="bg-gray-900 p-4 rounded-xl mb-4 border border-gray-700">
                            <label className="block text-center text-gray-400 mb-2 text-sm">
                                Pide el código al cliente para finalizar
                            </label>
                            <input
                                type="text"
                                pattern="\d*"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full text-center text-4xl tracking-[1rem] font-bold bg-black text-yellow-500 border-b-2 border-yellow-500 focus:outline-none py-2 mb-4 placeholder-gray-800"
                                placeholder="0000"
                            />
                        </div>

                        <ActionButton
                            onClick={handleComplete}
                            color="bg-black hover:bg-zinc-800"
                            label={submitting ? "Verificando..." : "Finalizar Entrega"}
                            icon={CheckCircle}
                            disabled={pin.length !== 4}
                            loading={submitting}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
