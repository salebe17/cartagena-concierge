import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardView } from '@/components/DashboardView';
import { getUserPropertiesBySession, getUserAlerts, getOwnerBookings, getOwnerServices } from '@/app/actions/dashboard';
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
        .select('full_name, avatar_url, phone, bio')
        .eq('id', user.id)
        .single();

    const userName = profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || "Anfitrión";
    const userFullName = profile?.full_name || user.user_metadata?.full_name || "Anfitrión";
    const userImage = profile?.avatar_url || user.user_metadata?.avatar_url;
    const userPhone = profile?.phone;
    const userBio = profile?.bio;

    // 3. Render View with Suspense
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent
                userName={userName}
                userFullName={userFullName}
                userImage={userImage}
                userPhone={userPhone}
                userBio={userBio}
                currentUserId={user.id}
            />
        </Suspense>
    );
}

// Wrapper component to handle data fetching inside Suspense
async function DashboardContent({ userName, userFullName, userImage, userPhone, userBio, currentUserId }: { userName: string, userFullName: string, userImage?: string, userPhone?: string, userBio?: string, currentUserId: string }) {
    const [properties, alerts, bookings, services] = await Promise.all([
        getUserPropertiesBySession(),
        getUserAlerts(),
        getOwnerBookings(),
        getOwnerServices()
    ]);

    return (
        <DashboardView
            userName={userName}
            userFullName={userFullName}
            userImage={userImage}
            userPhone={userPhone}
            userBio={userBio}
            currentUserId={currentUserId}
            properties={properties}
            alerts={alerts}
            serviceHistory={<ServiceHistory />}
            bookings={bookings}
            services={services}
        />
    );
}
