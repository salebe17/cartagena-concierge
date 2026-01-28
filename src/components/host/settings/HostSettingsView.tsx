'use client';

import { useState, useEffect } from 'react';
import { Shield, ChevronRight, Fingerprint, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface HostSettingsViewProps {
    onBack: () => void;
    userImage?: string;
    userName?: string;
    userPhone?: string;
    userBio?: string;
}

export function HostSettingsView({ onBack, userImage, userName, userPhone, userBio }: HostSettingsViewProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    // Persist biometric preference in localStorage
    // Persist biometric preference in localStorage
    // Fix: Initialize to false to match server, then update in useEffect to avoid hydration mismatch
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('biometric_enabled') === 'true';
        setBiometricEnabled(stored);
    }, []);
    const { toast } = useToast();

    // Manage profile state locally for editing
    const [profile, setProfile] = useState({
        name: userName || 'Anfitrión',
        phone: userPhone || '',
        bio: userBio || 'Superhost apasionado por el servicio.',
        avatar: userImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
    });

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const { updateProfileInfo } = await import('@/app/actions/profile');
            const result = await updateProfileInfo({
                name: profile.name,
                phone: profile.phone,
                bio: profile.bio
            });

            if (!result.success) throw new Error(result.error);

            toast({ title: "Perfil Actualizado", description: "Los cambios se han guardado correctamente." });
        } catch (error: any) {
            toast({ title: "Error", description: "No se pudieron guardar los cambios", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricToggle = async (enabled: boolean) => {
        if (enabled) {
            setIsLoading(true);
            try {
                const { registerBiometrics, checkBiometricCapability } = await import('@/lib/biometrics');

                // 1. Check if device is capable
                const canBio = await checkBiometricCapability();
                if (!canBio) {
                    throw new Error("❌ Tu celular no tiene bloqueo seguro configurado. Ve a Ajustes > Seguridad en tu Android/iOS y configura un PIN o Huella primero.");
                }

                toast({ title: "Configurando...", description: "Usa tu huella/rostro para crear la llave de acceso." });

                // 2. Register
                const credentialId = await registerBiometrics();

                // 3. Save
                setBiometricEnabled(true);
                localStorage.setItem('biometric_enabled', 'true');
                localStorage.setItem('biometric_cred_id', credentialId); // Save ID for future reference

                toast({ title: "✅ Seguridad Activada", description: "Tu Billetera está blindada con biometría." });

            } catch (e: any) {
                console.error(e);
                setBiometricEnabled(false);
                toast({
                    title: "Error de Activación",
                    description: e.message || "No se pudo completar el registro.",
                    variant: "destructive",
                    duration: 5000
                });
            } finally {
                setIsLoading(false);
            }
        } else {
            setBiometricEnabled(false);
            localStorage.setItem('biometric_enabled', 'false');
            localStorage.removeItem('biometric_cred_id');
            toast({ title: "Seguridad Desactivada", description: "Billetera visible sin seguridad." });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // Client-side upload logic would go here, but for simplicity/robustness without client setup in this file:
            // We'll use a direct fetch or existing client if imported.
            // Assuming we need to import createClient from local utils
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            // Save to DB
            const { updateProfileAvatar } = await import('@/app/actions/profile');
            const result = await updateProfileAvatar(publicUrl);

            if (!result.success) throw new Error(result.error);

            setProfile(prev => ({ ...prev, avatar: publicUrl }));
            toast({ title: "Foto Actualizada", description: "Tu nueva foto de perfil se ha guardado." });

            // Should refresh the page or parent to update the menu icon too
            window.location.reload();

            // @ts-ignore
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "No se pudo subir la imagen", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-right-8 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-[#222222] tracking-tight">Configuración</h1>
                </div>
            </div>

            <div className="space-y-8">

                {/* 1. Profile Photo Section */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="relative mb-4 group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md relative">
                            <img
                                src={profile.avatar}
                                alt="Profile"
                                className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                            />
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-rose-500" />
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                    <p className="text-sm font-bold text-gray-500">Foto de Perfil</p>
                    <p className="text-xs text-gray-400">Toca para cambiar</p>
                </div>

                {/* 2. Personal Info */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 ml-2">Información Personal</h3>
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400">Nombre Completo</label>
                            <Input
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="mt-1 border-gray-200"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400">Teléfono</label>
                            <Input
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="mt-1 border-gray-200"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400">Bio Corta</label>
                            <Input
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="mt-1 border-gray-200"
                            />
                        </div>
                        <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full bg-black hover:bg-gray-800 text-white font-bold rounded-xl mt-2">
                            {isLoading ? <Loader2 className="animate-spin" /> : <div className="flex items-center gap-2"><Save size={16} /> Guardar Cambios</div>}
                        </Button>
                    </div>
                </section>

                {/* 3. Security (Customized for OAuth) */}
                <section>
                    <div className="flex items-center gap-2 mb-3 ml-2">
                        <Shield size={16} className="text-rose-500" />
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Seguridad</h3>
                    </div>

                    <div className="bg-white rounded-3xl p-0 border border-gray-100 shadow-sm overflow-hidden">

                        {/* Biometric Toggle */}
                        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors relative z-10 cursor-pointer" onClick={() => handleBiometricToggle(!biometricEnabled)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${biometricEnabled ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Fingerprint size={24} />
                                </div>
                                <div className='flex flex-col'>
                                    <span className="font-bold text-gray-900">Proteger Billetera</span>
                                    <span className="text-xs text-gray-500">Pedir huella para ver saldo</span>
                                </div>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <Switch
                                    checked={biometricEnabled}
                                    onCheckedChange={handleBiometricToggle}
                                />
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 mx-6"></div>

                        {/* Google Account Indicator (Replaces Password) */}
                        <div className="p-6 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <div className='flex flex-col'>
                                    <span className="font-bold text-gray-900">Cuenta de Google</span>
                                    <span className="text-xs text-gray-500">Conectado. Gestionado por Google.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
                                <Shield size={12} />
                                Seguro
                            </div>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    );
}
