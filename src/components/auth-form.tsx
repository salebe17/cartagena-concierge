'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AuthForm() {
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    // We need a browser client for client-side auth
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleSendOtp = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOtp({
            phone: phone,
        })
        setLoading(false)

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } else {
            setStep('otp')
            toast({
                title: "OTP Sent",
                description: "Check your phone for the code."
            })
        }
    }

    const handleVerifyOtp = async () => {
        setLoading(true)
        const { error } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: 'sms'
        })
        setLoading(false)

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <Card className="w-full max-w-sm mx-auto bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
                <CardTitle className="text-emerald-400">Welcome Back</CardTitle>
                <CardDescription className="text-zinc-500">Login to request cash or deliver.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {step === 'phone' ? (
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+57 300 000 0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-zinc-950 border-zinc-700"
                        />
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleSendOtp}
                            disabled={loading || !phone}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Send Code'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="otp">Enter Code</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="bg-zinc-950 border-zinc-700 text-center tracking-widest"
                        />
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleVerifyOtp}
                            disabled={loading || !otp}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                        </Button>
                        <Button
                            variant="link"
                            className="w-full text-zinc-500"
                            onClick={() => setStep('phone')}
                        >
                            Change Phone Number
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
