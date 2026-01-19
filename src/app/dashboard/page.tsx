import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardUI from '@/components/dashboard-ui'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    return <DashboardUI user={user} order={order} />
}
