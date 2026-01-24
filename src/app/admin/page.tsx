import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { getAllServiceRequests } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const supabase = await createClient();

    // 1. Auth & Role Check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard'); // Only admins allowed
        return null;
    }

    // 2. Fetch Global Data
    const requests = await getAllServiceRequests();

    // 3. Render View
    return (
        <AdminDashboardView requests={requests} />
    );
}
