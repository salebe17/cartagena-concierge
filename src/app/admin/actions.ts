'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAdminData() {
    const supabase = await createClient() // Standard client for auth check
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user || user.email !== 'moisalebe@gmail.com') {
        throw new Error('Unauthorized Access')
    }

    // Use Service Role to bypass RLS for Admin Dashboard
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) throw new Error('Missing Service Role Key')

    const adminDb = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Parallel Fetching
    const [ordersRes, profilesRes, { data: { users } }] = await Promise.all([
        adminDb.from('orders').select('*').order('created_at', { ascending: false }),
        adminDb.from('profiles').select('id, full_name, role, kyc_status, kyc_id_url, kyc_selfie_url'),
        adminDb.auth.admin.listUsers()
    ])

    if (ordersRes.error) throw new Error(ordersRes.error.message)
    if (profilesRes.error) throw new Error(profilesRes.error.message)

    // Map profiles and emails to orders
    const ordersWithProfiles = ordersRes.data.map((order: any) => {
        const client = profilesRes.data.find(p => p.id === order.user_id)
        const driver = profilesRes.data.find(p => p.id === order.driver_id)
        const clientUser = users.find(u => u.id === order.user_id)

        return {
            ...order,
            client_name: client?.full_name || 'Unknown Client',
            client_email: clientUser?.email || 'No Email',
            driver_name: driver?.full_name || 'Unassigned'
        }
    })

    // Filter pending KYC users
    const pendingUsers = profilesRes.data
        .filter(p => p.kyc_status === 'pending')
        .map(p => ({
            ...p,
            email: users.find(u => u.id === p.id)?.email || 'No Email'
        }))

    return { orders: ordersWithProfiles, pendingUsers }
}
