"use client";

import { useEffect, useState } from "react";
import { getUserAlerts, markAlertRead } from "@/app/actions/dashboard";
import { Bell, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function NotificationsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            const data = await getUserAlerts();
            setAlerts(data);
            setLoading(false);
        };
        fetchAlerts();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await markAlertRead(id);
        setAlerts(alerts.filter(a => a.id !== id));
    };

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
                    <h1 className="text-4xl font-extrabold tracking-tight text-glow mb-2">Notifications</h1>
                    <p className="text-[var(--color-text-secondary)]">Stay updated on your service requests.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/20 flex items-center justify-center border border-[var(--color-primary)]/30">
                    <Bell className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
            </header>

            {alerts.length === 0 ? (
                <div className="glass rounded-3xl p-12 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">You're all caught up!</h3>
                    <p className="text-[var(--color-text-secondary)]">You don't have any unread notifications.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="glass rounded-2xl p-6 transition-all hover:border-[var(--color-primary)] border border-[var(--color-glass-border)] flex gap-4 items-start">
                            <div className="p-3 rounded-full bg-[var(--color-primary)]/10 shrink-0 mt-1">
                                {alert.type === 'info' ? <AlertCircle className="w-6 h-6 text-[var(--color-primary)]" /> : <Bell className="w-6 h-6 text-white" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg mb-1">{alert.title}</h4>
                                <p className="text-[var(--color-text-secondary)] mb-3">{alert.message}</p>
                                <div className="flex items-center text-xs text-gray-400 gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {new Date(alert.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <button
                                onClick={() => handleMarkAsRead(alert.id)}
                                className="text-sm font-bold text-[var(--color-primary)] hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                            >
                                Mark Read
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
