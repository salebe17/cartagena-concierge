import { Metadata } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';
import { LayoutDashboard, Users, CreditCard, ShieldAlert } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminMobileNav } from '@/components/admin/mobile-nav';
import { LogoutButton } from '@/components/logout-button';

export const metadata: Metadata = {
    title: 'Command Center | FairBid',
    description: 'Master Administration & Treasury Console',
};

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Moderation Hub', href: '/admin/users', icon: Users },
    { name: 'Treasury & Escrow', href: '/admin/finance', icon: CreditCard },
    { name: 'Disputes', href: '/admin/disputes', icon: ShieldAlert },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // if (!user) {
    //     redirect('/login');
    // }

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden text-white">
            {/* Desktop Sidebar Navigation */}
            <nav className="hidden md:flex w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex-col transition-all duration-300">
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-emerald-500 bg-clip-text text-transparent">
                        FairBid Command
                    </span>
                </div>

                <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <Icon
                                    className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[var(--color-primary)]"
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Logout Button Pinned to Bottom */}
                <div className="p-4 border-t border-gray-800">
                    <LogoutButton />
                </div>
            </nav>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto focus:outline-none flex flex-col min-h-screen">
                {/* Mobile Top Navigation */}
                <header className="md:hidden flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900 px-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-[var(--color-primary)] to-emerald-500 bg-clip-text text-transparent truncate max-w-[200px]">
                        FairBid
                    </span>
                    <AdminMobileNav />
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
