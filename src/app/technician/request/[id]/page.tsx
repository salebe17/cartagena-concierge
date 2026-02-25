"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, DollarSign, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { BidSchema } from "@/lib/validations";

export default function TechnicianBidPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [request, setRequest] = useState<Record<string, unknown> | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasBid, setHasBid] = useState(false);

  useEffect(() => {
    async function fetchRequest() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: reqData } = await supabase
        .from("service_requests")
        .select("*, requester:requester_id(id, full_name, avatar_url)")
        .eq("id", id)
        .single();

      if (reqData) {
        setRequest(reqData);
        setBidAmount(reqData.offered_price || reqData.quoted_price || 0);

        if (user) {
          // Check if I already bid on this
          const { data: bidData } = await supabase
            .from("bids")
            .select("*")
            .eq("request_id", id)
            .eq("technician_id", user.id)
            .single();

          if (bidData) setHasBid(true);
        }
      }
      setLoading(false);
    }
    fetchRequest();
  }, [id, supabase]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login first");
      return;
    }

    const payload = {
      request_id: id,
      technician_id: user.id,
      amount: bidAmount,
      status: "pending",
    };

    const parsed = BidSchema.safeParse(payload);
    if (!parsed.success) {
      alert("Validation Error: " + parsed.error.issues[0].message);
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("bids").insert(parsed.data);

    if (error) {
      console.error(error);
      alert("Error placing bid");
    } else {
      setHasBid(true);
    }
    setSubmitting(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-16 h-16 rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto pt-24">
      <Link
        href="/technician/dashboard"
        className="inline-flex items-center text-[var(--color-text-secondary)] hover:text-white transition-colors mb-8"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 bg-[rgba(0,229,255,0.1)] text-[var(--color-primary)] rounded-full text-xs font-bold uppercase tracking-wider">
              {request.service_type}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            {request.description}
          </h1>

          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] bg-white/5 w-max px-4 py-2 rounded-xl">
            <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Global Network</span>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
              Client is offering
            </p>
            <p className="text-4xl font-extrabold text-white">
              ${request.offered_price || request.quoted_price || 0} COP
            </p>
          </div>

          {hasBid ? (
            <div className="bg-[rgba(0,229,255,0.1)] border border-[var(--color-primary)] p-6 rounded-2xl flex flex-col items-center text-center">
              <Zap className="w-12 h-12 text-[var(--color-primary)] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Bid Submitted!
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                You have offered to do this job. Waiting for the client to
                review your bid and accept it.
              </p>
            </div>
          ) : request.status !== "pending" ? (
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Job is Closed
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                This job has already been assigned to another technician.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePlaceBid} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Suggest your price (COP)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-xl">
                    $
                  </span>
                  <input
                    type="number"
                    className="w-full input-luxury pl-10 text-2xl font-bold h-16 bg-[#121212] border-[#222] focus:border-[var(--color-primary)]"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    min="0"
                    step="5000"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  {[
                    request.offered_price,
                    request.offered_price * 1.2,
                    request.offered_price * 1.5,
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBidAmount(Math.round(preset))}
                      className="px-4 py-2 rounded-lg border border-[var(--color-glass-border)] text-xs font-bold text-white hover:bg-white/10 transition-colors"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setBidAmount(request.offered_price)}
                  className="flex-1 btn-secondary"
                >
                  Accept Client Offer
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary flex justify-center items-center h-[52px]"
                >
                  {submitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "Place Custom Bid"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
