import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardView } from '@/components/DashboardView';
import { getUserPropertiesBySession, getUserAlerts, getOwnerBookings } from '@/app/actions/dashboard';
import ServiceHistory from '@/components/dashboard/ServiceHistory';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/skeletons';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 2. Fetch User Profile Name (or fallback to metadata)
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    const userName = profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || "Anfitrión";

    // 3. Render View with Suspense
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent userName={userName} currentUserId={user.id} />
        </Suspense>
    );
}

// Wrapper component to handle data fetching inside Suspense
async function DashboardContent({ userName, currentUserId }: { userName: string, currentUserId: string }) {
    const [properties, alerts, bookings] = await Promise.all([
        getUserPropertiesBySession(),
        getUserAlerts(),
        getOwnerBookings()
    ]);

    return (
        <DashboardView
            userName={userName}
            currentUserId={currentUserId}
            properties={properties}
            alerts={alerts}
            serviceHistory={<ServiceHistory />}
            bookings={bookings}
        />
    );
}
