"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Shield, CheckCircle2, ChevronRight, LogOut, Phone } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default function SettingsPage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<any>(null);
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "");
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in pb-24">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-glow mb-2">Settings</h1>
                    <p className="text-[var(--color-text-secondary)]">Manage your account preferences.</p>
                </div>
            </header>

            {/* Profile Card */}
            <div className="glass rounded-3xl p-8 border-[var(--color-glass-border)] flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]/50 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-[var(--color-primary)]" />
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{profile?.full_name || "Guest Client"}</h2>
                    <div className="flex items-center gap-2 mt-2 text-[var(--color-text-secondary)]">
                        <Mail className="w-4 h-4" />
                        <span>{email}</span>
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold px-2 text-glow">Account details</h3>
                    
                    <div className="glass rounded-2xl p-4 flex items-center justify-between hover:border-[var(--color-primary)] cursor-pointer transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-white/5"><User className="w-5 h-5 text-[var(--color-primary)]" /></div>
                            <div>
                                <h4 className="font-bold">Personal Info</h4>
                                <p className="text-xs text-[var(--color-text-secondary)]">Name, phone, and avatar</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="glass rounded-2xl p-4 flex items-center justify-between hover:border-[var(--color-primary)] cursor-pointer transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-white/5"><Shield className="w-5 h-5 text-[var(--color-primary)]" /></div>
                            <div>
                                <h4 className="font-bold">Security</h4>
                                <p className="text-xs text-[var(--color-text-secondary)]">Password and active sessions</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold px-2 text-glow">Preferences</h3>
                    
                    <div className="glass rounded-2xl p-4 flex items-center justify-between hover:border-[var(--color-primary)] cursor-pointer transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-white/5"><CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" /></div>
                            <div>
                                <h4 className="font-bold">Notifications</h4>
                                <p className="text-xs text-[var(--color-text-secondary)]">Push and email alerts</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">Enabled</div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-8 mt-8 border-t border-[rgba(255,255,255,0.05)]">
                <LogoutButton />
            </div>
        </div>
    );
}
