"use server";

import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a PaymentIntent configured for "Manual Capture" (Escrow).
 * The funds are authorized and held on the client's card, but not transferred
 * until the technician successfully completes the job.
 */
export async function createHoldAndCaptureIntent(bidId: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Fetch Bid and related Service Request to get the agreed amount
    const { data: bid, error: bidError } = await supabase
      .from("bids")
      .select("amount, request_id, technician_id")
      .eq("id", bidId)
      .single();

    if (bidError || !bid) throw new Error("Bid not found");

    const stripe = getStripe();

    // 2. Create the PaymentIntent in Escrow mode
    // Note: Stripe requires amounts in the smallest currency unit (e.g., cents)
    // Since we are operating in COP, 1 COP is the smallest unit.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(bid.amount),
      currency: "cop",
      capture_method: "manual", // THIS IS THE CRITICAL ESCROW STEP
      metadata: {
        bidId: bidId,
        requestId: bid.request_id,
        technicianId: bid.technician_id,
        clientId: user.id,
      },
      // For Colombian cards, 3D Secure is highly recommended
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      success: true,
    };
  } catch (error: Error | unknown) {
    console.error("Escrow Creation Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create escrow intent.",
    };
  }
}
