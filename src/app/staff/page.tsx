import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Play, MapPin, Calendar, ArrowRight } from "lucide-react";

export const metadata = {
    title: 'Portal de Staff | Misiones Activas',
};

export default async function StaffIndexPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch requests that are ready for staff (confirmed or in_progress)
    // Ordered by requested_date ascending (closest first)
    const { data: requests, error } = await supabase
        .from('service_requests')
        .select(`
      id,
      service_type,
      requested_date,
      status,
      notes,
      properties (
        title,
        address
      )
    `)
        .in('status', ['confirmed', 'in_progress'])
        .order('requested_date', { ascending: true });

    if (error) {
        console.error("Error fetching staff missions:", error);
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-6 pb-24">

            {/* Header */}
            <div className="flex flex-col gap-1 mb-8">
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                    Misiones Activas
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                    Selecciona una asignación para comenzar.
                </p>
            </div>

            {/* List */}
            <div className="space-y-4 max-w-lg mx-auto">
                {requests && requests.length > 0 ? (
                    requests.map((req: any) => (
                        <Link key={req.id} href={`/staff/${req.id}`}>
                            <Card className="p-4 border-0 shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-all active:scale-[0.98] group">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                {req.service_type === 'cleaning' ? 'Limpieza' : 'Mantenimiento'}
                                            </span>
                                            {req.status === 'in_progress' && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                                                    En Curso
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                            {req.properties?.title || "Propiedad Desconocida"}
                                        </h3>
                                        <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                                            <MapPin size={12} />
                                            {req.properties?.address}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                                        <Calendar size={12} />
                                        {req.requested_date ? new Date(req.requested_date).toLocaleString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Sin Fecha'}
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">
                                        Abrir Misión
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <Play size={24} className="text-gray-400 ml-1" />
                        </div>
                        <p className="font-bold text-gray-500">No hay misiones pendientes</p>
                        <p className="text-xs text-gray-400 max-w-[200px]">Crea una solicitud en el Admin Dashboard y confírmala.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
