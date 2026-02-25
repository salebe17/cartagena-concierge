import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Users, Briefcase, DollarSign, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
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

    // Parallel data fetching for KPIs
    const [
        { count: totalUsers },
        { count: totalRequests },
        { data: uncapturedIntents }, // Simulating Escrow volume Check
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("service_requests").select("*", { count: "exact", head: true }),
        supabase.from("service_requests").select("offered_price").eq("stripe_payment_intent_status", "requires_capture"),
    ]);

    const escrowVolume = uncapturedIntents?.reduce((acc, curr) => acc + Number(curr.offered_price), 0) || 0;

    const stats = [
        { name: "Total Users", stat: totalUsers || 0, icon: Users },
        { name: "Platform Requests", stat: totalRequests || 0, icon: Briefcase },
        { name: "Live Escrow Volume", stat: `$${escrowVolume.toLocaleString("es-CO")} COP`, icon: DollarSign },
        { name: "System Uptime", stat: "99.99%", icon: Activity },
    ];

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Platform Overview
                    </h2>
                </div>
            </div>

            <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div
                        key={item.name}
                        className="relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
                    >
                        <dt>
                            <div className="absolute rounded-md bg-teal-500/10 p-3">
                                <item.icon className="h-6 w-6 text-teal-400" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-400">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                            <p className="text-2xl font-semibold text-white">{item.stat}</p>
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
