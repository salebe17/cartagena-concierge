import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DriverLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()

    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check Role
    const { data: profile } = await (await supabase)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'driver' && profile.role !== 'admin')) {
        // Unauthorized
        redirect('/dashboard')
    }

    return (
        <>
            {children}
        </>
    )
}
