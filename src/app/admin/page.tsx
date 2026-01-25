import { AdminDashboardView } from '@/components/AdminDashboardView';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
    // STATIC DUMMY TO ISOLATE SERVER ACTION CRASH
    // If actions work now, the issue was in the Page logic.
    return (
        <AdminDashboardView
            requests={[]}
            bookings={[]}
        />
    );
}
