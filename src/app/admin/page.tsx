import { getAdminData } from '@/app/actions'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/admin-dashboard-client'

// Force dynamic to ensure we always get fresh data
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    let data = { orders: [], pendingUsers: [] }

    try {
        data = await getAdminData() as any
    } catch (error) {
        // Redirect unauthorized access or handle error
        console.error("Access Denied or DB Error:", error)
        redirect('/')
    }

    return <AdminDashboardClient initialOrders={data.orders} initialPendingUsers={data.pendingUsers} />
}
