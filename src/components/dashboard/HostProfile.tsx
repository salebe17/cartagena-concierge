"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { User, Phone, Mail, Save } from "lucide-react";

export function HostProfile() {
    const account = useActiveAccount();
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [loading, setLoading] = useState(false); // Creating profile on load? or just editing.

    // Mock load for now, would be nice to have getUserProfile action
    useEffect(() => {
        // Load from localStorage or mock
        const saved = localStorage.getItem("host_profile");
        if (saved) setProfile(JSON.parse(saved));
        else if (account?.address) {
            setProfile(prev => ({ ...prev, email: `${account.address.slice(0, 6)}...@wallet.com` }));
        }
    }, [account]);

    const handleSave = () => {
        setLoading(true);
        // Simulate save
        setTimeout(() => {
            localStorage.setItem("host_profile", JSON.stringify(profile));
            setLoading(false);
            alert("Perfil guardado (Localmente por ahora)");
        }, 800);
    };

    return (
        <div className="max-w-2xl bg-gray-900 border border-white/10 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <span className="text-2xl font-bold text-black">{profile.name ? profile.name[0].toUpperCase() : "U"}</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">{profile.name || "Usuario"}</h2>
                    <p className="text-gray-400 text-sm font-mono">{account?.address}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-xs uppercase font-bold text-gray-500 mb-2 block flex items-center gap-2">
                        <User className="w-4 h-4" /> Nombre Completo
                    </label>
                    <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:border-yellow-500 outline-none transition-colors"
                        placeholder="Tu nombre"
                    />
                </div>
                <div>
                    <label className="text-xs uppercase font-bold text-gray-500 mb-2 block flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email de Contacto
                    </label>
                    <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:border-yellow-500 outline-none transition-colors"
                        placeholder="tucorreo@ejemplo.com"
                    />
                </div>
                <div>
                    <label className="text-xs uppercase font-bold text-gray-500 mb-2 block flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Teléfono / WhatsApp
                    </label>
                    <input
                        type="tel"
                        value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:border-yellow-500 outline-none transition-colors"
                        placeholder="+57 300 123 4567"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "Guardando..." : "Guardar Cambios"} <Save className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
