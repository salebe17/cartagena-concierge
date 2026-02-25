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
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-800">
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                                            Role
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                                            AI Risk Score
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                                            Stripe Status
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 bg-gray-950">
                                    {users?.map((person) => (
                                        <tr key={person.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                                                {person.first_name} {person.last_name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${person.role === 'admin' ? 'bg-purple-100 text-purple-800' : person.role === 'technician' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                    {person.role}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                {/* Mock AI Risk - Logic would pull from a real risk_score column calculated by Phase 9 AI */}
                                                <div className="flex items-center gap-2">
                                                    {Math.random() > 0.8 ? <ShieldAlert className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-teal-500" />}
                                                    {Math.floor(Math.random() * 20)}/100
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                                {person.stripe_account_status || "Not Connected"}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button className="text-red-400 hover:text-red-300 flex items-center justify-end gap-1 w-full">
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
