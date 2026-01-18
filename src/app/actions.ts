'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function calculateOrderFee(amount: number, distanceKm: number) {
    // Service Fee = 10% of amount
    const serviceFee = Math.round(amount * 0.10)

    // Delivery Fee
    let deliveryFee = 0
    if (distanceKm < 5) {
        deliveryFee = 20000
    } else if (distanceKm < 10) {
        deliveryFee = 30000
    } else {
        deliveryFee = 50000
    }

    const total = amount + serviceFee + deliveryFee

    return { serviceFee, deliveryFee, total }
}

export async function createOrder(formData: FormData) {
    const supabase = createClient()

    // 1. Get User
    const { data: { user }, error: authError } = await (await supabase).auth.getUser()
    if (authError || !user) {
        throw new Error('Unauthorized')
    }

    // 2. Parse Data
    const amount = Number(formData.get('amount'))
    // Mock distance for now as per prompt instructions regarding "Select Neighborhood (Mock distance)"
    // But strictly, we should probably get lat/lng or distance from the form.
    // Assuming the form sends 'distance' or we calculate it here. 
    // For this action, let's assume the form provides the calculated distance or location.
    // The user prompt says "Calculate fees again on the server".
    // So we need 'distance' passed in or calculated from coordinates.
    // Let's assume 'distance' is passed for simplicity in this step, or we'd need a map service here.
    const distance = Number(formData.get('distance')) || 5 // Default/Fallback

    const lat = Number(formData.get('lat'))
    const lng = Number(formData.get('lng'))

    // 3. Calculate Fees
    const { serviceFee, deliveryFee, total } = await calculateOrderFee(amount, distance)

    // 4. Generate Delivery Code (4 digits)
    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString()

    // 5. Insert Order
    const { data, error } = await (await supabase)
        .from('orders')
        .insert({
            user_id: user.id,
            amount,
            service_fee: serviceFee,
            delivery_fee: deliveryFee,
            total_amount: total,
            status: 'pending', // Initial status
            delivery_code: deliveryCode, // HIDDEN until paid
            location_lat: lat,
            location_lng: lng,
            distance_km: distance
        })
        .select('id')
        .single()

    if (error) {
        console.error('Order creation error:', error)
        throw new Error('Failed to create order')
    }

    revalidatePath('/dashboard')
    return data.id
}

export async function verifyDelivery(orderId: string, inputCode: string, signatureDataUrl: string) {
    const supabase = createClient()

    // 1. Fetch Order
    const { data: order, error: fetchError } = await (await supabase)
        .from('orders')
        .select('delivery_code, status')
        .eq('id', orderId)
        .single()

    if (fetchError || !order) {
        throw new Error('Order not found')
    }

    // 2. Verify Code
    if (order.delivery_code !== inputCode) {
        throw new Error('Invalid delivery code')
    }

    // 3. Update Status & Save Signature
    const { error: updateError } = await (await supabase)
        .from('orders')
        .update({
            status: 'delivered',
            signature_url: signatureDataUrl, // In real app, upload to Storage and save URL. saving base64 for now as requested/implied.
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (updateError) {
        throw new Error('Failed to update order')
    }

    revalidatePath('/driver')
    revalidatePath('/dashboard')
    return { success: true }
}
