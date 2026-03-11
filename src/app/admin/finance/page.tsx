import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Wallet, ArrowUpRight, TrendingUp } from "lucide-react";

export default async function AdminFinancePage() {
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

    // Fetch all pending Escrow Bids
    const { data: activeIntents } = await supabase
        .from("service_requests")
        .select("offered_price")
        .eq("stripe_payment_intent_status", "requires_capture");

    const totalEscrow = activeIntents?.reduce((acc, curr) => acc + Number(curr.offered_price), 0) || 0;

    // Predict Platform Take Rate (e.g., 15%)
    const projectedRevenue = totalEscrow * 0.15;

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-white">Treasury & Escrow</h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Real-time visual monitoring of Stripe Connected accounts, pending Payment Intents (Escrow), and platform revenue.
                    </p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-[var(--color-bg-card)] overflow-hidden shadow-[var(--shadow-card)] rounded-xl border border-[var(--color-border-dark)] card-hover group">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Wallet className="h-6 w-6 text-gray-500 group-hover:text-white transition-colors" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-bold text-gray-400 truncate uppercase tracking-wider">Total Held in Escrow (Stripe)</dt>
                                    <dd className="flex items-baseline mt-1">
                                        <div className="text-3xl font-bold text-white tracking-tight">${totalEscrow.toLocaleString('es-CO')} COP</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/40 px-5 py-3 border-t border-[var(--color-border-dark)]">
                        <div className="text-sm font-medium text-[var(--color-primary)] flex items-center gap-1">
                            <ArrowUpRight className="w-4 h-4 drop-shadow-[0_0_8px_var(--color-primary)]" /> Active Holds awaiting Capture
                        </div>
                    </div>
                </div>

                <div className="relative bg-[var(--color-bg-card)] overflow-hidden shadow-[var(--shadow-neon)] rounded-xl border border-[var(--color-primary)]/40 card-hover group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
                    <div className="p-5 relative z-10">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-6 w-6 text-[var(--color-primary)]" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-bold text-gray-400 truncate uppercase tracking-wider">Projected Platform Revenue (15%)</dt>
                                    <dd className="flex items-baseline mt-1">
                                        <div className="text-3xl font-extrabold text-[var(--color-primary)] drop-shadow-[0_0_8px_var(--color-primary)] tracking-tight">${projectedRevenue.toLocaleString('es-CO')} COP</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/60 px-5 py-3 relative z-10 border-t border-[var(--color-border-dark)]">
                        <div className="text-sm font-medium text-gray-400">
                            Will be deposited to Master Stripe Account
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
