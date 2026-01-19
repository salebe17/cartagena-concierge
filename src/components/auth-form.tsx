'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AuthForm() {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'email' | 'code'>('email')
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        }
    }

    const handleSendCode = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOtp({
            email,
        })
        setLoading(false)

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } else {
            setStep('code')
            toast({
                title: "Code Sent",
                description: "Check your email for the verification code."
            })
        }
    }

    const handleVerifyCode = async () => {
        setLoading(true)
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email'
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
        <div className="w-full">
            {/* Removed Card Wrapper to blend with Login Page */}

            <div className="space-y-6">
                <Button
                    variant="outline"
                    className="w-full h-12 border-zinc-200 hover:bg-zinc-50 hover:text-black relative bg-white text-zinc-900 font-medium transition-all"
                    onClick={handleGoogleLogin}
                >
                    <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Continue with Google
                </Button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-zinc-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#F9FAFB] px-2 text-zinc-400 font-medium tracking-wider">OR</span>
                    </div>
                </div>

                {step === 'email' ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-600 font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-white border-zinc-200 focus:ring-1 focus:ring-black text-lg"
                            />
                        </div>
                        <Button
                            className="w-full h-12 bg-zinc-900 hover:bg-black text-white font-semibold transition-all shadow-md hover:shadow-lg"
                            onClick={handleSendCode}
                            disabled={loading || !email}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Continue with Email'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp" className="text-zinc-600 font-medium">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="0 0 0 0 0 0"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="h-14 bg-white border-zinc-200 focus:ring-1 focus:ring-black text-center tracking-[0.5em] text-2xl font-mono"
                                maxLength={6}
                            />
                            <p className="text-xs text-zinc-400 text-center">Enter the code sent to {email}</p>
                        </div>
                        <Button
                            className="w-full h-12 bg-zinc-900 hover:bg-black text-white font-semibold transition-all shadow-md hover:shadow-lg"
                            onClick={handleVerifyCode}
                            disabled={loading || !otp}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-zinc-400 hover:text-zinc-900"
                            onClick={() => setStep('email')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Change Email
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
