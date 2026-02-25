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
                <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-gray-800">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Wallet className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-400 truncate">Total Held in Escrow (Stripe)</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-white">${totalEscrow.toLocaleString('es-CO')} COP</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-950 px-5 py-3">
                        <div className="text-sm text-teal-400 flex items-center gap-1">
                            <ArrowUpRight className="w-4 h-4" /> Active Holds awaiting Capture
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 overflow-hidden shadow rounded-lg border border-teal-900/50">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-6 w-6 text-teal-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-400 truncate">Projected Platform Revenue (15%)</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-teal-400">${projectedRevenue.toLocaleString('es-CO')} COP</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-950 px-5 py-3">
                        <div className="text-sm text-gray-400">
                            Will be deposited to Master Stripe Account
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
