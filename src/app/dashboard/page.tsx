import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardView } from '@/components/DashboardView';
import { getUserPropertiesBySession } from '@/app/actions';

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. Fetch User Profile Name (or fallback to metadata)
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    const userName = profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || "Anfitrión";

    // 3. Fetch Properties (Session Based)
    const properties = await getUserPropertiesBySession();

    // 4. Render View
    return (
        <DashboardView
            userName={userName}
            properties={properties}
        />
    );
}
