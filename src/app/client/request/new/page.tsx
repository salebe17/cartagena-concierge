"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Wrench,
  DollarSign,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCompletion } from "@ai-sdk/react";
import { ServiceRequestSchema } from "@/lib/validations";

export default function NewRequestPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_type: "maintenance",
    description: "",
    offered_price: 50000,
    address: "Metropolis Center", // Default or geolocation placeholder
  });

  const {
    complete,
    completion,
    isLoading: isEnhancing,
  } = useCompletion({
    api: "/api/ai/enhance",
    onFinish: (prompt, result) => {
      setFormData((prev) => ({ ...prev, description: result }));
    },
  });

  const handleEnhance = async () => {
    if (!formData.description) return;
    await complete(formData.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("You need to login first");
      setLoading(false);
      return;
    }

    const payload = {
      requester_id: user.id,
      service_type: formData.service_type,
      description: `${formData.address ? `Location: ${formData.address}\n\n` : ''}${formData.description}`,
      offered_price: formData.offered_price,
      status: "pending",
    };

    const parsed = ServiceRequestSchema.safeParse(payload);
    if (!parsed.success) {
      alert("Validation Error: " + parsed.error.issues[0].message);
      setLoading(false);
      return;
    }

    // Ensure the remote database's legacy `property_id` constraint is satisfied
    let propertyId = null;
    const { data: existingProperties } = await supabase
      .from("properties")
      .select("id")
      .limit(1);

    if (existingProperties && existingProperties.length > 0) {
      propertyId = existingProperties[0].id;
    } else {
      // Create a ghost property 
      const { data: newProperty, error: propError } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          title: "FairBid Virtual Location",
          address: formData.address || "Cartagena"
        })
        .select()
        .single();

      if (!propError && newProperty) {
        propertyId = newProperty.id;
      }
    }

    if (!propertyId) {
      alert("Error mapping location to legacy database structure. Please try again.");
      setLoading(false);
      return;
    }

    // Remove `version` and `deleted_at` fields since the remote Production DB lacks them
    const { version, deleted_at, ...safeInsertData } = parsed.data;

    // Inject the dummy property ID to bypass the DB `property_id` NOT NULL constraint
    const finalPayload = { ...safeInsertData, property_id: propertyId };

    const { data, error } = await supabase
      .from("service_requests")
      .insert(finalPayload)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Error creating request: " + error.message);
      setLoading(false);
    } else {
      router.push(`/client/request/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto pt-24">
      <Link
        href="/client/dashboard"
        className="inline-flex items-center text-[var(--color-text-secondary)] hover:text-white transition-colors mb-8"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2 text-glow">
            Name Your Price
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Technicians around you will see your offer and either accept or
            counter-bid.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Category */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["maintenance", "cleaning", "concierge", "transport"].map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, service_type: type })
                    }
                    className={`p-4 rounded-xl border text-sm font-bold uppercase transition-all ${formData.service_type === type
                      ? "border-[var(--color-primary)] bg-[rgba(0,229,255,0.1)] text-[var(--color-primary)] shadow-[var(--shadow-neon)] scale-[1.02]"
                      : "border-[var(--color-glass-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-white/20"
                      }`}
                  >
                    {type}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Where do you need it?
            </label>
            <input
              type="text"
              className="w-full input-luxury"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="e.g. Edificio Palmetto, Apt 1502"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-3 relative">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Describe the issue
              </label>
              <button
                type="button"
                onClick={handleEnhance}
                disabled={isEnhancing || !formData.description}
                className="text-xs flex items-center gap-1 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full hover:bg-purple-500/20 transition-colors border border-purple-500/30 disabled:opacity-50"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Smart Enhance
              </button>
            </div>
            <textarea
              className="w-full input-luxury min-h-[120px] resize-none"
              placeholder="E.g., The AC in the master bedroom is leaking water..."
              value={isEnhancing ? completion : formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isEnhancing}
              required
            />
          </div>

          {/* Price Offer */}
          <div className="space-y-3 pt-4 border-t border-[var(--color-glass-border)]">
            <label className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Your Offer (COP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-xl">
                $
              </span>
              <input
                type="number"
                className="w-full input-luxury pl-10 text-2xl font-bold bg-[#1A1A1A] border-[#333] focus:border-[var(--color-primary)] text-white"
                value={formData.offered_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    offered_price: Number(e.target.value),
                  })
                }
                min="0"
                step="5000"
                required
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Technicians might counter-offer. You choose who to hire.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || isEnhancing}
            className="w-full btn-primary mt-8 flex justify-center items-center h-14 text-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Request Service Now"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
