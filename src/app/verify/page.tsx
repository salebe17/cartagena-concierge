'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, Camera, ShieldCheck, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function VerifyPage() {
    const supabase = createClient()
    const router = useRouter()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<string>('unverified')
    const [idFile, setIdFile] = useState<File | null>(null)
    const [selfieFile, setSelfieFile] = useState<File | null>(null)

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push('/login')

            const { data: profile } = await supabase
                .from('profiles')
                .select('kyc_status')
                .eq('id', user.id)
                .single()

            if (profile) {
                setStatus(profile.kyc_status || 'unverified')
                if (profile.kyc_status === 'verified') {
                    router.push('/order')
                }
            }
            setLoading(false)
        }
        checkStatus()
    }, [supabase, router])

    const handleUpload = async () => {
        if (!idFile || !selfieFile) {
            return toast({
                title: "Missing Files",
                description: "Please upload both your ID and a Selfie.",
                variant: "destructive"
            })
        }

        setUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            // 1. Upload ID
            const idPath = `${user.id}/id_${Date.now()}`
            const { error: idError } = await supabase.storage
                .from('kyc-documents')
                .upload(idPath, idFile)
            if (idError) throw idError

            // 2. Upload Selfie
            const selfiePath = `${user.id}/selfie_${Date.now()}`
            const { error: selfieError } = await supabase.storage
                .from('kyc-documents')
                .upload(selfiePath, selfieFile)
            if (selfieError) throw selfieError

            // Get Public URLs (Assuming bucket is public, else use signed URLs or just path if RLS protects)
            // For this implementation we will store the public URL
            const { data: { publicUrl: idUrl } } = supabase.storage.from('kyc-documents').getPublicUrl(idPath)
            const { data: { publicUrl: selfieUrl } } = supabase.storage.from('kyc-documents').getPublicUrl(selfiePath)

            // 3. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    kyc_status: 'pending',
                    kyc_id_url: idUrl,
                    kyc_selfie_url: selfieUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setStatus('pending')
            toast({
                title: "Verification Submitted",
                description: "We will review your documents shortly.",
            })

        } catch (error: any) {
            console.error(error)
            toast({
                title: "Upload Failed",
                description: error.message || "Could not upload documents. Check invalid file types or connection.",
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

    if (status === 'pending') {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Verificación en Proceso</h2>
                    <p className="text-zinc-500">Estamos revisando tus documentos. Esto suele tomar menos de 10 minutos. Te notificaremos cuando tu cuenta esté activa.</p>
                    <Button variant="outline" className="mt-6" onClick={() => router.push('/dashboard')}>
                        Volver al Dashboard
                    </Button>
                </Card>
            </div>
        )
    }

    if (status === 'rejected') {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8 border-red-200 bg-red-50">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-red-900">Verificación Rechazada</h2>
                    <p className="text-red-700 mb-6">Tus documentos no pudieron ser verificados. Por favor intenta nuevamente con fotos más claras.</p>
                    <Button onClick={() => setStatus('unverified')}>
                        Intentar Nuevamente
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center p-6 md:justify-center">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold">Verificar Identidad</h1>
                    <p className="text-zinc-400">Por seguridad, necesitamos verificar tu identidad antes de tu primer pedido.</p>
                </div>

                <Card className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <CardHeader>
                        <CardTitle className="text-lg">Subir Documentos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* ID Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">1. Foto del Documento (ID/Pasaporte)</label>
                            <div className="border-2 border-dashed border-zinc-600 rounded-lg p-6 text-center hover:bg-zinc-700/50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                />
                                <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                                <p className="text-sm text-zinc-400">
                                    {idFile ? <span className="text-emerald-400 font-bold">{idFile.name}</span> : "Toca para subir foto"}
                                </p>
                            </div>
                        </div>

                        {/* Selfie Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">2. Selfie sosteniendo el Documento</label>
                            <div className="border-2 border-dashed border-zinc-600 rounded-lg p-6 text-center hover:bg-zinc-700/50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                                />
                                <Camera className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                                <p className="text-sm text-zinc-400">
                                    {selfieFile ? <span className="text-emerald-400 font-bold">{selfieFile.name}</span> : "Toca para subir selfie"}
                                </p>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 font-bold text-lg"
                            onClick={handleUpload}
                            disabled={!idFile || !selfieFile || uploading}
                        >
                            {uploading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {uploading ? "Enviando..." : "Enviar para Revisión"}
                        </Button>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
