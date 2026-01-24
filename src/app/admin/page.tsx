import { getAdminData } from '@/app/admin/actions'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/admin-dashboard-client'

// Force dynamic to ensure we always get fresh data
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    let data = { orders: [], pendingUsers: [] }

    try {
        const rawData = await getAdminData() as any
        // Serialize BigInts to strings to avoid "Do not know how to serialize a BigInt" or related TypeErrors during build/render
        data = JSON.parse(JSON.stringify(rawData, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
    } catch (error) {
        // Redirect unauthorized access or handle error
        console.error("Access Denied or DB Error:", error)
        redirect('/')
    }

    return <AdminDashboardClient initialOrders={data.orders} initialPendingUsers={data.pendingUsers} />
}
