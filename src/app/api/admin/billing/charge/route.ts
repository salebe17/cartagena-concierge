import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { sendInvoiceEmail } from '@/app/actions/notifications';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { requestId } = body;

        if (!requestId) {
            return NextResponse.json({ success: false, error: "Missing requestId" }, { status: 400 });
        }

        const supabase = await createAdminClient(); // Strict Admin Client

        // 1. Get Request and Property Owner Mapping
        const { data: reqData, error: reqError } = await supabase
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

        if (reqError || !reqData) {
            return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
        }

        const ownerId = (reqData.properties as any).owner_id;

        // 2. Get Stripe Customer
        const { data: customerMapping } = await supabase
            .from('stripe_customers')
            .select('stripe_customer_id')
            .eq('profile_id', ownerId)
            .single();

        if (!customerMapping) {
            return NextResponse.json({ success: false, error: "Owner has no payment method registered." }, { status: 400 });
        }

        // 3. Define Amount based on type (Mocking logic for now)
        const amounts: Record<string, number> = {
            cleaning: 40000,
            maintenance: 50000,
            concierge: 15000
        };
        const amount = amounts[reqData.service_type] || 20000;

        // 4. Create Charge in Stripe
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'cop',
            customer: customerMapping.stripe_customer_id,
            payment_method_types: ['card'],
            off_session: true,
            confirm: true,
            description: `Servicio ${reqData.service_type} - ID: ${requestId}`,
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
            // Calling the notification util directly is fine as long as it doesn't use 'use server' with specific headers/cookies conflicts
            // If sendInvoiceEmail is a server action, better to inline logic or move it to a lib file.
            // Assuming it's safe for now or we just fire and forget.
            sendInvoiceEmail({
                email: ownerProfile.email,
                customerName: ownerProfile.full_name || 'Host',
                invoiceId: invoice.id,
                amount: amount,
                serviceType: reqData.service_type
            }).catch(e => console.error("Notification trigger failed:", e));
        }

        // 7. Mark Request as fully closed
        await supabase.from('service_requests').update({ status: 'completed' }).eq('id', requestId);

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("[API] Charge Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
