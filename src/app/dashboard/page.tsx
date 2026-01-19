import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Get Auth User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 2. Get Profile (Try to read DB)
    // Note: We use user?.id to avoid error if user is null, though logically we might want to see that.
    const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

    return (
        <div className="min-h-screen bg-black text-green-400 p-10 font-mono text-sm overflow-auto">
            <h1 className="text-xl font-bold border-b border-gray-700 mb-4">🕵️‍♂️ DEBUG MODE</h1>

            <div className="mb-8">
                <h2 className="text-white mb-2">AUTH USER (Quien soy):</h2>
                <pre>{JSON.stringify(user, null, 2)}</pre>
                {authError && <p className="text-red-500">Auth Error: {authError.message}</p>}
            </div>

            <div className="mb-8">
                <h2 className="text-white mb-2">DATABASE PROFILE (Qué ve la DB):</h2>
                {/* If this is NULL, it's an RLS Permission issue */}
                <pre>{JSON.stringify(profile, null, 2)}</pre>
                {dbError && <p className="text-red-500 font-bold text-lg">DB Error: {dbError.message} - {dbError.details}</p>}
            </div>

            <div className="p-4 bg-gray-900 border border-gray-700 rounded">
                <p className="text-white">Diagnóstico Rápido:</p>
                <ul className="list-disc ml-5 mt-2 text-gray-400">
                    <li>Si <strong>Profile</strong> es <code>null</code>: Problema de Permisos (RLS).</li>
                    <li>Si <strong>kyc_status</strong> dice algo diferente a 'verified': Problema de Datos.</li>
                    <li>Si hay un <strong>DB Error</strong> rojo: Problema de Código/Columnas.</li>
                </ul>
            </div>
        </div>
    );
}
