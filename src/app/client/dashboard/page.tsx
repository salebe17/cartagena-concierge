"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, ArrowRight, Clock, CheckCircle, Flame, Building } from "lucide-react";

export default function ClientDashboard() {
    const supabase = createClient();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();

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
        if (!user) return; // Note: In testing bypass, user is mocked

        const { data } = await supabase
            .from("service_requests")
            .select("*")
            .eq("requester_id", user.id)
            .order("created_at", { ascending: false });

        if (data) setRequests(data);
        setLoading(false);
    }

    // Animation Variants
    const containerVars = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVars = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="pt-10 sm:pt-16 px-4 sm:px-8 pb-32 sm:pb-12">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6"
            >
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-4">
                        <Building className="w-4 h-4 text-[var(--color-primary)]" />
                        Client Portal
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                        My <span className="text-gradient">Requests</span>
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-3 sm:text-lg max-w-xl">
                        Monitor the status of your properties and manage private service bids in real-time.
                    </p>
                </div>

                <Link href="/client/request/new">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[var(--color-primary)] to-[#d4ff33] rounded-2xl text-black font-bold shadow-[0_0_20px_#c6ff004d] transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <Plus className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">New Request</span>
                    </motion.button>
                </Link>
            </motion.div>

            {/* Content Section */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-4"
                    >
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass rounded-3xl h-32 w-full animate-pulse bg-white/5 border-white/5" />
                        ))}
                    </motion.div>
                ) : requests.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-[2rem] p-12 text-center flex flex-col items-center border-dashed border-2 border-white/10 bg-black/20"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--color-primary)]/20 to-transparent flex items-center justify-center mb-6 shadow-inner">
                            <Flame className="w-10 h-10 text-[var(--color-primary)] animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">No Active Requests</h3>
                        <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm text-lg leading-relaxed">
                            You haven't requested any services yet. Post a job and elite technicians will bid instantly.
                        </p>
                        <Link href="/client/request/new">
                            <button className="btn-secondary px-8 py-4 rounded-2xl">Publish First Request</button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        variants={containerVars}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4"
                    >
                        {requests.map((req) => (
                            <motion.div variants={itemVars} key={req.id}>
                                <Link href={`/client/request/${req.id}`}>
                                    <div className="glass rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 card-hover group relative overflow-hidden">

                                        {/* Hover Gradient Injection */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/0 via-[var(--color-primary)]/5 to-[var(--color-primary)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                                        <div className="flex-1 min-w-0 z-10">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                                    {req.service_type || "Service"}
                                                </span>
                                                {req.status === 'pending' ? (
                                                    <span className="flex items-center gap-1.5 text-white/60 text-sm font-medium bg-white/5 px-2.5 py-1 rounded-lg">
                                                        <Clock className="w-3.5 h-3.5 text-yellow-400" /> Bidding Open
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-[var(--color-primary)] text-sm font-medium bg-[var(--color-primary)]/5 px-2.5 py-1 rounded-lg">
                                                        <CheckCircle className="w-3.5 h-3.5" /> {req.status}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2 truncate pr-4">
                                                {req.description?.substring(0, 60) || "No description provided"}
                                            </h3>
                                            <p className="text-[var(--color-text-secondary)] text-sm font-medium">
                                                Offered: <span className="text-white">COP ${req.quoted_price || req.offered_price || 0}</span>
                                            </p>
                                        </div>

                                        <div className="w-full sm:w-auto flex justify-end z-10">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-black group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 shadow-lg">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
