'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calculateOrderFee, createOrder } from '@/app/actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import LocationPicker from '@/components/location-picker'

const CASH_PACKS = [
    { value: '200000', label: '$200.000', sub: 'COP' },
    { value: '500000', label: '$500.000', sub: 'COP' },
    { value: '1000000', label: '$1.000.000', sub: 'COP' },
]

// Mock neighborhoods with distances from "Alto Bosque"
const NEIGHBORHOODS = [
    { value: 'bocagrande', label: 'Bocagrande', distance: 8.5 },
    { value: 'manga', label: 'Manga', distance: 4.2 },
    { value: 'crespo', label: 'Crespo', distance: 12.0 },
    { value: 'centro', label: 'Centro Histórico', distance: 6.8 },
]

export function OrderForm() {
    const [step, setStep] = useState(1)
    const [amount, setAmount] = useState('')
    // const [neighborhood, setNeighborhood] = useState('') // Replaced by more specific location
    const [loading, setLoading] = useState(false)
    const [fees, setFees] = useState<{ serviceFee: number, deliveryFee: number, total: number } | null>(null)

    // Location State
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>({ lat: 10.391, lng: -75.479 }) // Default Cartagena
    const [addressDetails, setAddressDetails] = useState('')
    const [phone, setPhone] = useState('')
    const [usingGps, setUsingGps] = useState(false)

    const { toast } = useToast()
    const router = useRouter()

    // Fetch Profile for Auto-Fill
    useEffect(() => {
        const loadProfile = async () => {
            const { getProfile } = await import('@/app/actions') // Dynamic import to avoid server-action-in-client-bundle issues if any, or just direct import
            const profile = await getProfile()
            if (profile?.phone) {
                setPhone(profile.phone)
            }
        }
        loadProfile()
    }, [])

    const getCurrentLocation = () => {
        setUsingGps(true)
        if (!navigator.geolocation) {
            toast({ title: "Error", description: "Geolocation is not supported by your browser", variant: "destructive" })
            setUsingGps(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
                setUsingGps(false)
                toast({ title: "Location Found", description: "Map updated to your current location." })
            },
            (error) => {
                toast({ title: "Error", description: "Unable to retrieve your location", variant: "destructive" })
                setUsingGps(false)
            }
        )
    }

    const isFormValid = phone.length >= 7 && addressDetails.trim().length > 0 && coordinates

    const handleCalculate = async () => {
        if (!amount || !coordinates) return

        // Validation: Phone and Location Details required before review
        if (!isFormValid) {
            toast({
                title: "Information Missing",
                description: "Por favor ingresa un celular válido (mínimo 7 dígitos) y detalles de ubicación.",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        // Simple mock distance calc or fixed fallback since we don't have routing engine here
        // In real app, we'd calculate distance from HQ to 'coordinates'
        const distance = 5 // Mock for now as agreed

        try {
            const result = await calculateOrderFee(Number(amount), distance)
            setFees(result)
            setStep(3)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to calculate fees",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOrder = async () => {
        // Double check validation
        if (!isFormValid) {
            toast({
                title: "Information Missing",
                description: "Por favor ingresa un celular válido y detalles de ubicación para continuar.",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        const distance = 5 // Mock

        const lat = coordinates?.lat || 10.391 // Fallback if missing
        const lng = coordinates?.lng || -75.479

        try {
            const result = await createOrder(Number(amount), distance, lat, lng, phone)

            if (typeof result === 'object' && result?.error) {
                toast({
                    title: "Error Creating Order",
                    description: result.error,
                    variant: "destructive"
                })
                return
            }

            toast({
                title: "Order Created",
                description: "Redirecting to payment..."
            })
            router.push('/dashboard')
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Progress Bar */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-black' : 'bg-gray-200'}`} />
                ))}
            </div>

            <Card className="border-none shadow-2xl bg-white text-zinc-900 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-8">
                                    <h2 className="text-2xl font-bold font-serif tracking-tight">Select Amount</h2>
                                    <p className="text-zinc-400 text-sm">How much cash do you need delivered?</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {CASH_PACKS.map((pack) => (
                                        <button
                                            key={pack.value}
                                            onClick={() => {
                                                setAmount(pack.value)
                                                // Optional auto-advance feel
                                            }}
                                            className={`
                                                relative group flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-200
                                                ${amount === pack.value
                                                    ? 'border-black bg-zinc-50 shadow-md ring-1 ring-black'
                                                    : 'border-zinc-100 hover:border-zinc-300 hover:shadow-sm bg-white'
                                                }
                                            `}
                                        >
                                            <div className="flex flex-col text-left">
                                                <span className={`text-xl font-bold ${amount === pack.value ? 'text-black' : 'text-zinc-600'}`}>
                                                    {pack.label}
                                                </span>
                                                <span className="text-xs text-zinc-400 font-medium tracking-widest uppercase">{pack.sub}</span>
                                            </div>
                                            <div className={`
                                                w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                ${amount === pack.value ? 'border-black bg-black' : 'border-zinc-200'}
                                            `}>
                                                {amount === pack.value && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Live Summary */}
                                {amount && (
                                    <div className="mt-6 p-5 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3 shadow-inner">
                                        <div className="flex justify-between text-sm text-zinc-500">
                                            <span>Solicitado:</span>
                                            <span>${Number(amount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-zinc-500">
                                            <span>Tarifa Servicio (10%):</span>
                                            <span>${(Number(amount) * 0.10).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-zinc-500">
                                            <span>Domicilio:</span>
                                            <span>$15,000</span>
                                        </div>
                                        <div className="pt-3 border-t border-zinc-200 flex justify-between items-center">
                                            <span className="font-bold text-zinc-900">TOTAL A PAGAR:</span>
                                            <span className="text-2xl font-black text-zinc-900">
                                                ${(Number(amount) + (Number(amount) * 0.10) + 15000).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!amount}
                                    className="w-full h-14 text-lg bg-black hover:bg-zinc-800 text-white rounded-xl mt-4 transition-all"
                                >
                                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-4">
                                    <h2 className="text-2xl font-bold font-serif tracking-tight">Exact Location</h2>
                                    <p className="text-zinc-400 text-sm">Help the driver find you.</p>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12 border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                        onClick={getCurrentLocation}
                                        disabled={usingGps}
                                    >
                                        {usingGps ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <MapPin className="w-4 h-4 mr-2 text-emerald-600" />}
                                        Use my current location
                                    </Button>

                                    {/* Mini Map Picker */}
                                    <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-zinc-200 relative shadow-inner">
                                        {coordinates ? (
                                            // Dynamic Import Wrapper
                                            <div className="w-full h-full">
                                                {/* Requires importing LocationPicker above. Doing dynamic import here or top level. */}
                                                <LocationPicker
                                                    lat={coordinates.lat}
                                                    lng={coordinates.lng}
                                                    onChange={(lat, lng) => setCoordinates({ lat, lng })}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                                                Map Loading...
                                            </div>
                                        )}
                                        {/* Overlay Instruction */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold shadow-sm z-[400] pointer-events-none">
                                            DRAG PIN TO ADJUST
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-500 font-medium ml-1">Location Details</Label>
                                        <Input
                                            required
                                            placeholder="Apt 201, Building Name, Color..."
                                            value={addressDetails}
                                            onChange={(e) => setAddressDetails(e.target.value)}
                                            className="h-12 border-zinc-200 bg-zinc-50 rounded-xl focus:ring-black"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-500 font-medium ml-1">Número de Celular (WhatsApp)</Label>
                                        <Input
                                            required
                                            type="tel"
                                            placeholder="300 123 4567"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="h-12 border-zinc-200 bg-zinc-50 rounded-xl focus:ring-black"
                                        />
                                    </div>

                                    {coordinates && (
                                        <div className="flex items-center justify-center text-emerald-600 text-xs font-bold bg-emerald-50 py-2 rounded-lg">
                                            <span className="mr-2">✅</span> Exact Location Saved
                                        </div>
                                    )}

                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="h-14 w-14 rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                                    >
                                        <ArrowRight className="h-5 w-5 rotate-180" />
                                    </Button>
                                    <Button
                                        onClick={handleCalculate}
                                        disabled={!isFormValid || loading}
                                        style={{ opacity: !isFormValid ? 0.5 : 1 }}
                                        className={`flex-1 h-14 text-lg rounded-xl transition-all ${!isFormValid
                                                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                                                : 'bg-black hover:bg-zinc-800 text-white'
                                            }`}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : (!isFormValid ? "⚠️ Completa Campos" : "Review Details")}
                                    </Button>
                                </div>
                                {!isFormValid && (
                                    <p className="text-center text-xs text-orange-600 mt-3 font-medium animate-pulse">
                                        ⚠️ Completa los campos (Celular y Ubicación) para continuar
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {step === 3 && fees && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-6">
                                    <h2 className="text-2xl font-bold font-serif tracking-tight">Summary</h2>
                                    <p className="text-zinc-400 text-sm">Review your order details.</p>
                                </div>

                                <div className="bg-zinc-50 p-6 rounded-2xl space-y-4 border border-zinc-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500">Requested Cash</span>
                                        <span className="font-semibold text-zinc-900">${Number(amount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500">Service Fee</span>
                                        <span className="font-medium text-zinc-900">${fees.serviceFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500">Fast Delivery</span>
                                        <span className="font-medium text-zinc-900">${fees.deliveryFee.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-zinc-200 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg text-zinc-900">Total to Pay</span>
                                        <span className="font-bold text-2xl text-zinc-900">${fees.total.toLocaleString()}</span>
                                    </div>
                                    {addressDetails && (
                                        <div className="mt-4 pt-4 border-t border-zinc-200 text-xs text-zinc-500">
                                            <p className="font-bold mb-1">Delivery Attempt At:</p>
                                            <p>{addressDetails}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(2)}
                                        className="h-14 w-14 rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                                    >
                                        <ArrowRight className="h-5 w-5 rotate-180" />
                                    </Button>
                                    <Button
                                        onClick={handleCreateOrder}
                                        disabled={!isFormValid || loading}
                                        style={{ opacity: !isFormValid ? 0.5 : 1 }}
                                        className={`flex-1 h-14 text-lg rounded-xl font-bold shadow-lg transition-all ${!isFormValid
                                                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed shadow-none'
                                                : 'bg-[#D4AF37] hover:bg-[#b5952f] text-white shadow-orange-100'
                                            }`}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : (!isFormValid ? "⚠️ Completa Celular y Ubicación" : "Confirm & Pay")}
                                    </Button>
                                </div>
                                <p className="text-center text-xs text-zinc-300 mt-4">
                                    Secure 256-bit encrypted transaction.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    )
}
