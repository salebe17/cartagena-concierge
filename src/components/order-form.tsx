'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight, Check, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calculateOrderFee, createOrder } from '@/app/actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

const CASH_PACKS = [
    { value: '200000', label: '$200.000 COP' },
    { value: '500000', label: '$500.000 COP' },
    { value: '1000000', label: '$1.000.000 COP' },
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
    const [neighborhood, setNeighborhood] = useState('')
    const [loading, setLoading] = useState(false)
    const [fees, setFees] = useState<{ serviceFee: number, deliveryFee: number, total: number } | null>(null)

    const { toast } = useToast()
    const router = useRouter()

    const handleCalculate = async () => {
        if (!amount || !neighborhood) return

        setLoading(true)
        const selectedNeighborhood = NEIGHBORHOODS.find(n => n.value === neighborhood)
        const distance = selectedNeighborhood?.distance || 5

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
        setLoading(true)
        const selectedNeighborhood = NEIGHBORHOODS.find(n => n.value === neighborhood)
        const distance = selectedNeighborhood?.distance || 5

        const formData = new FormData()
        formData.append('amount', amount)
        formData.append('distance', distance.toString())
        // In a real app we would send precise lat/lng
        formData.append('lat', '10.0')
        formData.append('lng', '-75.0')

        try {
            const orderId = await createOrder(formData)
            toast({
                title: "Order Created",
                description: "Redirecting to payment...",
            })
            // Simulating Stripe Flow - in real app, we'd redirect to Stripe URL returned by action
            // For now, let's redirect to dashboard as "Pending Payment"
            router.push('/dashboard')
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create order. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-emerald-400">Cartagena Concierge</CardTitle>
                <CardDescription className="text-zinc-400">Secure Cash Delivery</CardDescription>
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label>Select Amount</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    {CASH_PACKS.map((pack) => (
                                        <Button
                                            key={pack.value}
                                            variant={amount === pack.value ? "default" : "outline"}
                                            className={`justify-start h-12 text-lg ${amount === pack.value ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-none' : 'border-zinc-700 hover:bg-zinc-800 hover:text-white'}`}
                                            onClick={() => setAmount(pack.value)}
                                        >
                                            {pack.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label>Delivery Location</Label>
                                <Select value={neighborhood} onValueChange={setNeighborhood}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                                        <SelectValue placeholder="Select Neighborhood" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                                        {NEIGHBORHOODS.map((n) => (
                                            <SelectItem key={n.value} value={n.value}>
                                                {n.label} (~{n.distance}km)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && fees && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                                <div className="flex justify-between text-zinc-400">
                                    <span>Cash Amount</span>
                                    <span>${Number(amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span>Service Fee (10%)</span>
                                    <span>${fees.serviceFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span>Delivery Fee</span>
                                    <span>${fees.deliveryFee.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-zinc-700 my-2 pt-2 flex justify-between text-xl font-bold text-emerald-400">
                                    <span>Total</span>
                                    <span>${fees.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
            <CardFooter className="flex justify-between">
                {step > 1 && (
                    <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-zinc-400 hover:text-white">
                        Back
                    </Button>
                )}
                <div className="ml-auto">
                    {step === 1 && (
                        <Button
                            onClick={() => setStep(2)}
                            disabled={!amount}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    {step === 2 && (
                        <Button
                            onClick={handleCalculate}
                            disabled={!neighborhood || loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Review Order'}
                        </Button>
                    )}
                    {step === 3 && (
                        <Button
                            onClick={handleCreateOrder}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Pay Now'}
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
