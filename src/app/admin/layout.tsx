import { Metadata } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';
import { LayoutDashboard, Users, CreditCard, ShieldAlert } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden text-white">
            {/* Sidebar Navigation */}
            <nav className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
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
                                    className="mr-3 h-5 w-5 text-gray-500 group-hover:text-teal-400"
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto focus:outline-none">
                <div className="min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
