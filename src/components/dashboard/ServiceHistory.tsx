import { createClient } from '@/lib/supabase/server'
import { Clock, CheckCircle2, Sparkles, Wrench, Ship } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function ServiceHistory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Consulta compleja: Traemos las solicitudes + el nombre de la propiedad
    const { data: requests } = await supabase
        .from('service_requests')
        .select(`
      *,
      properties (title)
    `)
        // Filtramos indirectamente por las propiedades del usuario
        // (Gracias a las políticas RLS que configuramos, esto es seguro por defecto)
        .order('created_at', { ascending: false })
        .limit(5)

    if (!requests || requests.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400">
                <p>No tienes solicitudes de servicio recientes.</p>
            </div>
        )
    }

    // Diccionario de Iconos y Colores
    const getIcon = (type: string) => {
        switch (type) {
            case 'cleaning': return <Sparkles size={16} className="text-rose-500" />
            case 'maintenance': return <Wrench size={16} className="text-blue-500" />
            case 'concierge': return <Ship size={16} className="text-cyan-500" />
            default: return <Clock size={16} className="text-gray-400" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700"><Clock size={12} /> Pendiente</span>
            case 'confirmed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><CheckCircle2 size={12} /> Confirmado</span>
            case 'completed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><CheckCircle2 size={12} /> Finalizado</span>
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Desconocido</span>
        }
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="text-gray-400" size={20} />
                Actividad Reciente
            </h2>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {requests.map((req) => (
                        <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">

                            <div className="flex items-center gap-4">
                                {/* Icono del Servicio */}
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                    {getIcon(req.service_type)}
                                </div>

                                <div>
                                    <p className="font-bold text-gray-900 text-sm">
                                        {req.service_type === 'cleaning' ? 'Limpieza Express' :
                                            req.service_type === 'maintenance' ? 'Mantenimiento' : 'Concierge'}
                                    </p>
                                    <p className="text-xs text-gray-500 flex gap-1">
                                        <span className="font-medium text-gray-700">
                                            {/* @ts-ignore: Supabase join typing can be tricky */}
                                            {req.properties?.title}
                                        </span>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: es })}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                {getStatusBadge(req.status)}
                                {req.requested_date && (
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        Para: {new Date(req.requested_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
                <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                    <button className="text-xs font-bold text-gray-500 hover:text-[#FF5A5F] transition-colors">Ver todo el historial</button>
                </div>
            </div>
        </div>
    )
}
