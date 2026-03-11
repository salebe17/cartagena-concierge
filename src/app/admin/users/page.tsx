import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ShieldAlert, CheckCircle, Ban } from "lucide-react";

export default async function AdminUsersPage() {
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

    const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-white">Platform Users</h1>
                    <p className="mt-2 text-sm text-gray-400">
                        A list of all users in the FairBid platform including their roles and AI-generated Risk Scores.
                    </p>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-[var(--shadow-card)] ring-1 ring-[var(--color-border-dark)] md:rounded-xl glass">
                            <table className="min-w-full divide-y divide-[var(--color-border-dark)]">
                                <thead className="bg-[#121212]/80 backdrop-blur-md">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-bold text-[var(--color-primary)] tracking-wide sm:pl-6">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold text-[var(--color-primary)] tracking-wide">
                                            Role
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold text-[var(--color-primary)] tracking-wide">
                                            AI Risk Score
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold text-[var(--color-primary)] tracking-wide">
                                            Stripe Status
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border-dark)] bg-transparent">
                                    {users?.map((person) => (
                                        <tr key={person.id} className="hover:bg-white/5 transition-colors duration-200">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                                                {person.first_name} {person.last_name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold leading-5 ${
                                                    person.role === 'admin' 
                                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                                        : person.role === 'technician' 
                                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                                            : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                                                }`}>
                                                    {person.role}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                {/* Mock AI Risk - Logic would pull from a real risk_score column calculated by Phase 9 AI */}
                                                <div className="flex items-center gap-2 font-medium">
                                                    {Math.random() > 0.8 
                                                        ? <ShieldAlert className="w-4 h-4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> 
                                                        : <CheckCircle className="w-4 h-4 text-[var(--color-primary)] drop-shadow-[0_0_8px_var(--color-primary)]" />}
                                                    <span className={Math.random() > 0.8 ? "text-red-400" : "text-gray-300"}>
                                                        {Math.floor(Math.random() * 20)}/100
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 font-mono">
                                                {person.stripe_account_status || "Not Connected"}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button className="text-red-400 hover:text-red-300 flex items-center justify-end gap-1 w-full transition-colors">
                                                    <Ban className="w-4 h-4" /> Suspend
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
