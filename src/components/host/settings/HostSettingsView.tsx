'use client';

import { useState } from 'react';
import { Shield, ChevronRight, Fingerprint, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface HostSettingsViewProps {
    onBack: () => void;
    userImage?: string;
    userName?: string;
}

export function HostSettingsView({ onBack, userImage, userName }: HostSettingsViewProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const { toast } = useToast();

    const [profile, setProfile] = useState({
        name: userName || 'Anfitrión',
        phone: '+57 300 123 4567',
        bio: 'Superhost apasionado por el servicio.',
    });

    const handleSaveProfile = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        toast({ title: "Perfil Actualizado", description: "Los cambios se han guardado correctamente." });
    };

    const handleBiometricToggle = async (enabled: boolean) => {
        if (enabled) {
            // Simulate Biometric Challenge
            const confirmed = window.confirm("¿Deseas habilitar el inicio de sesión biométrico (FaceID/Huella)?");
            if (confirmed) {
                toast({ title: "Huella Digital", description: "Escaneando...", duration: 2000 });
                setTimeout(() => {
                    setBiometricEnabled(true);
                    toast({ title: "Seguridad Activada", description: "Ahora puedes ingresar con biometría." });
                }, 1500);
            }
        } else {
            setBiometricEnabled(false);
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
                        <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md">
                            <img
                                src={userImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500">Foto de Perfil</p>
                    <p className="text-xs text-gray-400">Visible para tus huéspedes y aliados</p>
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

                {/* 3. Security & Biometrics */}
                <section>
                    <div className="flex items-center gap-2 mb-3 ml-2">
                        <Shield size={16} className="text-rose-500" />
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Seguridad</h3>
                    </div>

                    <div className="bg-white rounded-3xl p-0 border border-gray-100 shadow-sm overflow-hidden">

                        {/* Mock Biometric Toggle */}
                        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${biometricEnabled ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Fingerprint size={24} />
                                </div>
                                <div className='flex flex-col'>
                                    <span className="font-bold text-gray-900">Biometría</span>
                                    <span className="text-xs text-gray-500">FaceID / TouchID</span>
                                </div>
                            </div>
                            <Switch
                                checked={biometricEnabled}
                                onCheckedChange={handleBiometricToggle}
                            />
                        </div>

                        <div className="h-px bg-gray-100 mx-6"></div>

                        {/* Password Change */}
                        <button className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                                    <Shield size={20} />
                                </div>
                                <div className='flex flex-col'>
                                    <span className="font-bold text-gray-900">Contraseña</span>
                                    <span className="text-xs text-gray-500">Actualizar clave de acceso</span>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>

                    </div>
                    <p className="text-xs text-gray-400 mt-2 px-4">
                        La autenticación biométrica permite un acceso más rápido y seguro sin escribir contraseñas.
                    </p>
                </section>

            </div>
        </div>
    );
}
