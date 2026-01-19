import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardUI from '@/components/dashboard-ui'

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect(`/login?next=/order/${id}`)

    // Fetch specific order safely
    const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Security check: Ensure owner
        .single()

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Order Not Found</h1>
                    <p className="text-zinc-500">The order you are looking for does not exist or you do not have permission to view it.</p>
                </div>
            </div>
        )
    }

    return <DashboardUI user={user} order={order} />
}
