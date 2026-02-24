"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Search, Wrench, Clock, DollarSign, Filter } from "lucide-react";

export default function TechnicianDashboard() {
    const supabase = createClient();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOpenRequests();

        // Subscribe to new requests
        const channel = supabase
            .channel("open_requests")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "service_requests", filter: "status=eq.pending" },
                (payload) => {
                    fetchOpenRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchOpenRequests() {
        const { data, error } = await supabase
            .from("service_requests")
            .select("*, requester:requester_id(id, full_name, avatar_url)")
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (data) setRequests(data);
        setLoading(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin w-16 h-16 rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen p-6 max-w-4xl mx-auto pt-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-glow tracking-tight">Gig Radar</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">Find active jobs nearby and bid to win.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            className="bg-[var(--color-bg-card)] border border-[var(--color-glass-border)] rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] w-48 transition-all"
                        />
                    </div>
                    <button className="p-2 rounded-full border border-[var(--color-glass-border)] bg-[var(--color-bg-card)] hover:bg-white/10 transition-colors">
                        <Filter className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="glass rounded-2xl p-4">
                    <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Available Jobs</p>
                    <p className="text-2xl font-bold text-white">{requests.length}</p>
                </div>
                <div className="glass rounded-2xl p-4">
                    <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Today's Earnings</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">$0</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {requests.length === 0 ? (
                    <div className="md:col-span-2 glass flex flex-col items-center justify-center p-12 rounded-3xl text-center border-dashed border-[rgba(255,255,255,0.2)]">
                        <Search className="w-12 h-12 text-[var(--color-text-secondary)] mb-4" />
                        <h3 className="text-xl font-bold mb-2">No jobs available right now</h3>
                        <p className="text-[var(--color-text-secondary)] max-w-sm">
                            Keep this screen open. When a client requests a service, it will appear here instantly.
                        </p>
                    </div>
                ) : (
                    requests.map((req, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={req.id}
                        >
                            <Link href={`/technician/request/${req.id}`}>
                                <div className="glass rounded-3xl p-6 card-hover cursor-pointer h-full flex flex-col group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-[rgba(0,229,255,0.1)] text-[var(--color-primary)] rounded-full text-xs font-bold uppercase tracking-wider">
                                            {req.service_type}
                                        </span>
                                        <span className="flex items-center gap-1 text-[var(--color-text-secondary)] text-sm font-medium">
                                            <Clock className="w-4 h-4" /> Just now
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[56px]">
                                        {req.description}
                                    </h3>

                                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm mb-6 mt-auto">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>Global Network</span> {/* Make dynamic later */}
                                    </div>

                                    <div className="flex justify-between items-end border-t border-[rgba(255,255,255,0.05)] pt-4 mt-auto">
                                        <div>
                                            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Client Offer</p>
                                            <p className="text-2xl font-extrabold text-[#00E5FF] group-hover:text-white transition-colors">
                                                ${req.offered_price || req.quoted_price || 0}
                                            </p>
                                        </div>
                                        <button className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold group-hover:bg-[var(--color-primary)] transition-colors">
                                            Bid Now
                                        </button>
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
