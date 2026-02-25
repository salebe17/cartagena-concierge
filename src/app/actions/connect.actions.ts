"use server";

import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { headers } from "next/headers";

/**
 * Creates or retrieves a Stripe Connect account for a technician,
 * and generates an onboarding link.
 */
export async function createConnectAccount(technicianId: string) {
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

    // 1. Verify Authentication & Role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== technicianId) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_account_id, email, full_name")
      .eq("id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    const stripe = getStripe();
    let accountId = profile.stripe_account_id;

    // 2. Create the account if it doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: profile.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        individual: {
          first_name: profile.full_name?.split(" ")[0] || "",
          last_name: profile.full_name?.split(" ").slice(1).join(" ") || "",
        },
        metadata: {
          technicianId: user.id,
        },
      });

      accountId = account.id;

      // Save the newly created account ID to Supabase
      await supabase
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
    }

    // 3. Generate the Account Link for Onboarding
    const origin =
      (await headers()).get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/technician/dashboard?connect_refresh=true`,
      return_url: `${origin}/technician/dashboard?connect_success=true`,
      type: "account_onboarding",
    });

    return {
      url: accountLink.url,
      success: true,
    };
  } catch (error: Error | unknown) {
    console.error("Stripe Connect Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate connect link.",
    };
  }
}
