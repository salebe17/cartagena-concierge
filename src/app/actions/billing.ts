'use server'

import { getStripe } from '@/lib/stripe';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/lib/types';
import { sendInvoiceEmail } from './notifications';
import { deepSerialize } from '@/lib/utils/serialization';

export async function getOrCreateStripeCustomer(): Promise<ActionResponse<string>> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        // 1. Check existing
        const { data: existing } = await supabase
            .from('stripe_customers')
            .select('stripe_customer_id')
            .eq('profile_id', user.id)
            .single();

        if (existing) return deepSerialize({ success: true, data: existing.stripe_customer_id });

        // 2. Create in Stripe
        const stripe = getStripe();
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { supabase_id: user.id }
        });

        // 3. Save mapping (Using Admin Client to bypass RLS for write if needed, though policy allows it)
        const adminDb = await createAdminClient();
        const { error } = await adminDb
            .from('stripe_customers')
            .insert({
                profile_id: user.id,
                stripe_customer_id: customer.id
            });

        if (error) throw error;

        return deepSerialize({ success: true, data: customer.id });
    } catch (e: any) {
        console.error("Stripe Customer Error:", e);
        return { success: false, error: e.message };
    }
}

export async function createSetupIntent(): Promise<ActionResponse<{ clientSecret: string }>> {
    try {
        const customerRes = await getOrCreateStripeCustomer();
        if (!customerRes.success || !customerRes.data) throw new Error(customerRes.error);

        const stripe = getStripe();
        const setupIntent = await stripe.setupIntents.create({
            customer: customerRes.data,
            payment_method_types: ['card'],
        });

        if (!setupIntent.client_secret) throw new Error("Failed to create SetupIntent");

        return deepSerialize({ success: true, data: { clientSecret: setupIntent.client_secret } });
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getHostPaymentMethods(): Promise<ActionResponse<any[]>> {
    try {
        const customerRes = await getOrCreateStripeCustomer();
        if (!customerRes.success || !customerRes.data) return { success: true, data: [] };

        const stripe = getStripe();
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerRes.data,
            type: 'card',
        });

        return deepSerialize({ success: true, data: paymentMethods.data });
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function chargeServiceRequest(requestId: string): Promise<ActionResponse> {
    try {
        const supabase = await createAdminClient(); // Admin client to see mapping

        // 1. Get Request and Property Owner Mapping
        const { data: request, error: reqError } = await supabase
            .from('service_requests')
            .select(`
                id,
                service_type,
                properties (
                    owner_id
                )
            `)
            .eq('id', requestId)
            .single();

        if (reqError || !request) throw new Error("Request not found");
        const ownerId = (request.properties as any).owner_id;

        // 2. Get Stripe Customer
        const { data: customerMapping } = await supabase
            .from('stripe_customers')
            .select('stripe_customer_id')
            .eq('profile_id', ownerId)
            .single();

        if (!customerMapping) throw new Error("Owner has no payment method registered.");

        // 3. Define Amount based on type (Mocking logic for now)
        const amounts: Record<string, number> = {
            cleaning: 40000,
            maintenance: 50000,
            concierge: 15000
        };
        const amount = amounts[request.service_type] || 20000;

        // 4. Create Charge in Stripe via Payment Intent
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // stripe uses cents for USD but COP is zero-decimal? 
            // Stripe COP is zero-decimal: https://docs.stripe.com/currencies#special-cases
            currency: 'cop',
            customer: customerMapping.stripe_customer_id,
            payment_method_types: ['card'],
            off_session: true,
            confirm: true,
            description: `Servicio ${request.service_type} - ID: ${requestId}`,
        });

        // 5. Create Invoice Record
        const { data: invoice } = await supabase.from('invoices').insert({
            profile_id: ownerId,
            service_request_id: requestId,
            amount: amount,
            status: 'paid',
            stripe_invoice_id: paymentIntent.id
        }).select().single();

        // 6. Send Email Notification (Async/Non-blocking)
        const { data: ownerProfile } = await supabase.from('profiles').select('email, full_name').eq('id', ownerId).single();
        if (ownerProfile?.email && invoice) {
            sendInvoiceEmail({
                email: ownerProfile.email,
                customerName: ownerProfile.full_name || 'Host',
                invoiceId: invoice.id,
                amount: amount,
                serviceType: request.service_type
            }).catch(e => console.error("Notification trigger failed:", e));
        }

        // 7. Mark Request as fully closed (Maybe a new status like 'archived' or 'paid')
        // For now we'll just keep it as 'completed' or 'paid'
        await supabase.from('service_requests').update({ status: 'completed' }).eq('id', requestId);

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        return deepSerialize({ success: true });
    } catch (e: any) {
        console.error("Charge Error:", e);
        return { success: false, error: e.message };
    }
}
