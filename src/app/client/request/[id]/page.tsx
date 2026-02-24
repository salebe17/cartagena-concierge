"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, X, ShieldCheck, Loader2, DollarSign } from "lucide-react";
import Link from "next/link";

export default function ClientRequestPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const supabase = createClient();

    const [request, setRequest] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState<string | null>(null);

    useEffect(() => {
        fetchData();

        // Subscribe to bids for this request
        const channel = supabase
            .channel(`bids_for_request_${id}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "bids", filter: `request_id=eq.${id}` },
                (payload) => {
                    fetchData(); // Refresh to get profile data of bidder
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    async function fetchData() {
        const { data: reqData } = await supabase
            .from("service_requests")
            .select("*")
            .eq("id", id)
            .single();

        if (reqData) setRequest(reqData);

        const { data: bidsData } = await supabase
            .from("bids")
            .select("*, technician:technician_id(id, full_name, avatar_url, kyc_status)")
            .eq("request_id", id)
            .order("amount", { ascending: true }); // Lowest bids first

        if (bidsData) setBids(bidsData);
        setLoading(false);
    };

    const handleAcceptBid = async (bidId: string) => {
        setAccepting(bidId);

        // Accept the bid
        await supabase.from("bids").update({ status: 'accepted' }).eq("id", bidId);

        // Update the request with the accepted bid
        await supabase.from("service_requests").update({
            status: 'confirmed',
            accepted_bid_id: bidId
        }).eq("id", id);

        // Refresh
        await fetchData();
        setAccepting(null);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin w-16 h-16 rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
        </div>
    );

    const isConfirmed = request?.status !== 'pending';

    return (
        <div className="min-h-screen p-6 max-w-3xl mx-auto pt-24">
            <Link href="/client/dashboard" className="inline-flex items-center text-[var(--color-text-secondary)] hover:text-white transition-colors mb-8">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Dashboard
            </Link>

            <div className="grid md:grid-cols-3 gap-8">

                {/* Request Details Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass rounded-3xl p-6 border-[rgba(0,229,255,0.2)]">
                        <h2 className="text-xl font-bold mb-4 text-glow">Your Request</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Service Type</p>
                                <p className="font-semibold capitalize">{request?.service_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Details</p>
                                <p className="text-sm">{request?.description}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Offered Price</p>
                                <p className="text-xl font-bold text-[var(--color-primary)]">${request?.offered_price || request?.quoted_price || 0} COP</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bids Feed */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                {!isConfirmed && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isConfirmed ? 'bg-gray-500' : 'bg-[var(--color-primary)]'}`}></span>
                            </span>
                            {isConfirmed ? (
                                "Technician Confirmed"
                            ) : (
                                bids.length > 0 ? `${bids.length} Live Bids` : "Waiting for technicians..."
                            )}
                        </h2>
                    </div>

                    <div className="space-y-4 relative">
                        {bids.length === 0 && !isConfirmed && (
                            <div className="glass rounded-2xl p-8 text-center flex flex-col items-center">
                                <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin opacity-50 mb-4" />
                                <p className="text-[var(--color-text-secondary)]">Broadcasting your request to nearby technicians...</p>
                            </div>
                        )}

                        <AnimatePresence>
                            {bids.map((bid) => (
                                <motion.div
                                    key={bid.id}
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    layout
                                    className={`glass rounded-2xl p-6 transition-all ${bid.status === 'accepted'
                                        ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)] ring-opacity-50'
                                        : (isConfirmed && bid.status !== 'accepted' ? 'opacity-40 grayscale' : 'hover:border-[var(--color-primary)] border-[var(--color-glass-border)]')
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border-2 border-[var(--color-glass-border)]">
                                                {bid.technician.avatar_url ? (
                                                    <img src={bid.technician.avatar_url} alt="Technician" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                                                        {bid.technician.full_name?.charAt(0) || "T"}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg flex items-center gap-2">
                                                    {bid.technician.full_name || "Guest Technician"}
                                                    {bid.technician.kyc_status === 'approved' && (
                                                        <ShieldCheck className="w-4 h-4 text-green-400" />
                                                    )}
                                                </h4>
                                                <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                                                    4.9 ★ (120 jobs)
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Bid Price</p>
                                            <p className={`text-2xl font-extrabold ${bid.amount <= request.offered_price ? 'text-[var(--color-primary)]' : 'text-orange-400'}`}>
                                                ${bid.amount}
                                            </p>
                                        </div>
                                    </div>

                                    {!isConfirmed && (
                                        <div className="mt-6 flex gap-3">
                                            <button
                                                onClick={() => handleAcceptBid(bid.id)}
                                                disabled={accepting !== null}
                                                className="flex-1 btn-primary hover:bg-[var(--color-primary-dark)] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                                            >
                                                {accepting === bid.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Accept Technician</>}
                                            </button>
                                        </div>
                                    )}

                                    {bid.status === 'accepted' && (
                                        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-between text-[var(--color-accent)] font-bold">
                                            <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Technician Hired</span>
                                            <Link href={`/messages/${request.id}`} className="text-white hover:underline text-sm font-normal">Message</Link>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
