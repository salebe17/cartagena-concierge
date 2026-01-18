'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SignaturePad } from '@/components/signature-pad'
import { verifyDelivery } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DriverOrderPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [step, setStep] = useState<'otp' | 'signature'>('otp')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)

    // In a real app we would client-side fetch the order details to display here
    // For now, we focus on the delivery completion flow.

    const handleVerifyOtp = () => {
        if (otp.length === 4) {
            // In a real app we might verify OTP against server first before signature, 
            // but the action does both. Let's ask for signature next.
            setStep('signature')
        } else {
            toast({
                title: "Invalid Code",
                description: "Please enter a 4-digit code.",
                variant: "destructive"
            })
        }
    }

    const handleCompleteDelivery = async (signatureData: string) => {
        setLoading(true)
        try {
            await verifyDelivery(params.id as string, otp, signatureData)
            toast({
                title: "Success",
                description: "Order marked as delivered.",
                variant: "default" // success
            })
            router.push('/driver')
        } catch (error) {
            toast({
                title: "Error",
                description: "Invalid code or delivery failed.",
                variant: "destructive"
            })
            setStep('otp') // Reset if failed
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <Link href="/driver" className="flex items-center text-zinc-400 mb-6 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>

            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Complete Delivery</CardTitle>
                    <CardDescription className="text-zinc-500">Order ID: {params.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {step === 'otp' && (
                        <div className="space-y-4">
                            <Label htmlFor="otp">Enter Client Delivery Code</Label>
                            <Input
                                id="otp"
                                placeholder="0000"
                                maxLength={4}
                                className="bg-zinc-950 border-zinc-700 text-center text-2xl tracking-widest h-14"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <Button
                                onClick={handleVerifyOtp}
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                disabled={otp.length !== 4}
                            >
                                Next
                            </Button>
                        </div>
                    )}

                    {step === 'signature' && (
                        <div className="space-y-4">
                            <Label>Client Signature</Label>
                            <SignaturePad onSave={handleCompleteDelivery} />
                            {loading && <div className="text-center text-zinc-400"><Loader2 className="animate-spin inline mr-2" /> Processing...</div>}
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    )
}
