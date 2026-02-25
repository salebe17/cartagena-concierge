"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, ArrowRight, Clock, CheckCircle } from "lucide-react";

export default function ClientDashboard() {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();

        // Subscribe to realtime updates
        const channel = supabase
            .channel("service_requests_channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "service_requests" },
                (payload) => {
                    fetchRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchRequests() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // In a real app we would join with bids count
        const { data } = await supabase
            .from("service_requests")
            .select("*")
            .eq("requester_id", user.id)
            .order("created_at", { ascending: false });

        if (data) setRequests(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse w-16 h-16 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 max-w-4xl mx-auto pt-24">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-glow">My Requests</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">Manage your service bids</p>
                </div>
                <Link href="/client/request/new">
                    <button className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">New Request</span>
                    </button>
                </Link>
            </div>

            <div className="grid gap-6">
                {requests.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-10 text-center flex flex-col items-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-[rgba(0,229,255,0.1)] flex items-center justify-center mb-4">
                            <Plus className="w-10 h-10 text-[var(--color-primary)] opacity-80" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Active Requests</h3>
                        <p className="text-[var(--color-text-secondary)] mb-6 max-w-sm">
                            You haven&apos;t requested any services yet. Post a request and technicians will bid for your job instantly.
                        </p>
                        <Link href="/client/request/new">
                            <button className="btn-secondary">Get Started</button>
                        </Link>
                    </motion.div>
                ) : (
                    requests.map((req, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={req.id}
                        >
                            <Link href={`/client/request/${req.id}`}>
                                <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-hover cursor-pointer group">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-[rgba(0,229,255,0.1)] text-[var(--color-primary)] rounded-full text-xs font-bold uppercase tracking-wider">
                                                {req.service_type || "Service"}
                                            </span>
                                            {req.status === 'pending' ? (
                                                <span className="flex items-center gap-1 text-[var(--color-text-secondary)] text-sm">
                                                    <Clock className="w-4 h-4" /> Bidding Open
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[var(--color-accent)] text-sm">
                                                    <CheckCircle className="w-4 h-4" /> {req.status}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 truncate max-w-[280px] sm:max-w-md">
                                            {req.description?.substring(0, 50) || "No description"}...
                                        </h3>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            Offered: COP ${req.quoted_price || req.offered_price || 0}
                                        </p>
                                    </div>
                                    <div className="w-full sm:w-auto flex justify-end">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
