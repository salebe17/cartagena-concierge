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
    const [whatsapp, setWhatsapp] = useState('')
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push('/login')

            const { data: profile } = await supabase
                .from('profiles')
                .select('*') // Get all to show name/avatar
                .eq('id', user.id)
                .single()

            if (profile) {
                setProfile(profile)
                setWhatsapp(profile.whatsapp_number || profile.phone || '') // Pre-fill
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
                title: "Faltan Archivos",
                description: "Por favor sube ambos documentos (ID y Selfie).",
                variant: "destructive"
            })
        }
        if (!whatsapp || whatsapp.length < 7) {
            return toast({
                title: "Falta WhatsApp",
                description: "Ingresa un número válido para contactarte.",
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

            // Get Public URLs
            const { data: { publicUrl: idUrl } } = supabase.storage.from('kyc-documents').getPublicUrl(idPath)
            const { data: { publicUrl: selfieUrl } } = supabase.storage.from('kyc-documents').getPublicUrl(selfiePath)

            // 3. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    kyc_status: 'pending',
                    kyc_id_url: idUrl,
                    kyc_selfie_url: selfieUrl,
                    whatsapp_number: whatsapp, // Store WhatsApp
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setStatus('pending')
            toast({
                title: "Verificación Enviada",
                description: "Revisaremos tus documentos pronto.",
            })

        } catch (error: any) {
            console.error(error)
            toast({
                title: "Error",
                description: error.message || "No se pudieron subir los documentos.",
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="animate-spin text-emerald-500" /></div>

    if (status === 'pending') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8 bg-zinc-900 border-zinc-800">
                    <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Verificación en Proceso</h2>
                    <p className="text-zinc-400">⏳ Tus documentos están en revisión. Te notificaremos por WhatsApp cuando te aprobemos.</p>
                    <Button variant="outline" className="mt-6 border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => router.push('/dashboard')}>
                        Volver al Dashboard
                    </Button>
                </Card>
            </div>
        )
    }

    if (status === 'rejected') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8 border-red-900/30 bg-red-950/10">
                    <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-red-500">Verificación Denegada</h2>
                    <p className="text-red-400 mb-6">❌ Verificación denegada. Contacta soporte.</p>
                    <Button onClick={() => setStatus('unverified')} className="bg-red-600 hover:bg-red-700">
                        Intentar Nuevamente
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 md:justify-center">
            <div className="max-w-md w-full space-y-8">

                {/* User Identity Header */}
                <div className="text-center space-y-4">
                    {profile?.avatar_url && (
                        <div className="mx-auto w-20 h-20 rounded-full border-2 border-emerald-500 overflow-hidden relative">
                            <img src={profile.avatar_url} alt="Profile" className="object-cover w-full h-full" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">Verificación de Identidad Requerida</h1>
                        <p className="text-zinc-400 text-sm">Para seguridad de todos, necesitamos validar quién eres antes de tu primer pedido.</p>
                    </div>
                </div>

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Formulario de Seguridad
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* WhatsApp Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Número de WhatsApp <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="+57 300 123 4567"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className="bg-black border-zinc-700 text-white focus:ring-emerald-500"
                            />
                            <p className="text-xs text-zinc-500">Vital para la entrega.</p>
                        </div>

                        {/* ID Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">1. Foto del Documento (ID/Pasaporte)</label>
                            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:bg-zinc-800/50 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                />
                                <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                                <p className="text-sm text-zinc-400 group-hover:text-emerald-400 transition-colors">
                                    {idFile ? <span className="text-emerald-400 font-bold">{idFile.name}</span> : "Toca para subir foto"}
                                </p>
                            </div>
                        </div>

                        {/* Selfie Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">2. Selfie sosteniendo el Documento</label>
                            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:bg-zinc-800/50 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                                />
                                <Camera className="w-8 h-8 mx-auto mb-2 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                                <p className="text-sm text-zinc-400 group-hover:text-emerald-400 transition-colors">
                                    {selfieFile ? <span className="text-emerald-400 font-bold">{selfieFile.name}</span> : "Toca para subir selfie"}
                                </p>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 font-bold text-lg text-white"
                            onClick={handleUpload}
                            disabled={!idFile || !selfieFile || uploading}
                        >
                            {uploading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {uploading ? "Enviando..." : "Enviar Documentos"}
                        </Button>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
