import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

// Initialize Stripe (Env var needed: STRIPE_SECRET_KEY)
const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
    return new Stripe(key, {
        apiVersion: '2025-01-27.acacia' as any,
    });
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        if (!endpointSecret) throw new Error("Missing Webhook Secret");
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Handle critical events
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            // Recover Invoice from Metadata? Or Upsert using Stripe ID?
            // If our DB insert failed in 'charge/route.ts', we fix it here.

            console.log(`[Webhook] Payment Succeeded: ${paymentIntent.id}`);

            // Upsert Invoice to ensure consistency
            // Note: We need service_request_id from metadata to link it correctly.
            // Assuming we pass it in metadata in charge/route.ts (We should have!)
            // If we didn't, we should add it.

            // Mock logic for resilience:
            // await supabase.from('invoices').upsert(...)

            break;

        case 'payment_intent.payment_failed':
            // Log failure, maybe alert admin
            console.error(`[Webhook] Payment Failed: ${event.data.object.id}`);
            break;

        default:
            console.log(`[Webhook] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
