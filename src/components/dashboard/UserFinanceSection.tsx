"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Receipt, AlertCircle, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Invoice {
    id: string;
    amount: number;
    status: 'paid' | 'unpaid' | 'void' | 'refunded';
    created_at: string;
    paid_at?: string;
    service_requests?: {
        service_type: string;
        properties?: {
            title: string;
        }
    }
}

export function UserFinanceSection() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSpent: 0, pending: 0 });

    useEffect(() => {
        const fetchInvoices = async () => {
            const supabase = createClient();

            const { data, error } = await supabase
                .from('invoices')
                .select(`
                    *,
                    service_requests (
                        service_type,
                        properties (title)
                    )
                `)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setInvoices(data as any);

                // Calculate stats
                const total = data.filter(i => i.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0);
                const pending = data.filter(i => i.status === 'unpaid').length;
                setStats({ totalSpent: total, pending });
            }
            setLoading(false);
        };

        fetchInvoices();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <p className="text-xs font-black uppercase text-emerald-600 tracking-widest mb-1">Total Gastado</p>
                <p className="text-2xl font-black text-emerald-800">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                <p className="text-xs font-black uppercase text-orange-600 tracking-widest mb-1">Pendientes</p>
                <p className="text-2xl font-black text-orange-800">{stats.pending}</p>
            </div>
        </div>

            {/* Breakdown by Service Type */ }
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                 <h3 className="text-sm font-bold text-[#222222] mb-4">Desglose por Servicio</h3>
                 <div className="space-y-3">
                    {/* Cleaning */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <span className="text-xs">🧹</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Limpieza</span>
                        </div>
                        <span className="text-sm font-bold text-[#222222]">
                            {formatCurrency(invoices
                                .filter(i => i.status === 'paid' && i.service_requests?.service_type === 'cleaning')
                                .reduce((sum, i) => sum + (i.amount || 0), 0)
                            )}
                        </span>
                    </div>

                    {/* Maintenance */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                <span className="text-xs">🔧</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Mantenimiento</span>
                        </div>
                        <span className="text-sm font-bold text-[#222222]">
                            {formatCurrency(invoices
                                .filter(i => i.status === 'paid' && i.service_requests?.service_type === 'maintenance')
                                .reduce((sum, i) => sum + (i.amount || 0), 0)
                            )}
                        </span>
                    </div>

                     {/* Others */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                <span className="text-xs">📦</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Otros</span>
                        </div>
                        <span className="text-sm font-bold text-[#222222]">
                            {formatCurrency(invoices
                                .filter(i => i.status === 'paid' && !['cleaning', 'maintenance'].includes(i.service_requests?.service_type || ''))
                                .reduce((sum, i) => sum + (i.amount || 0), 0)
                            )}
                        </span>
                    </div>
                 </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                    <Receipt size={16} className="text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-700">Historial de Transacciones</h3>
                </div>

                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                    {invoices.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No hay transacciones registradas.</div>
                    ) : (
                        invoices.map((inv) => (
                            <div key={inv.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <DollarSign size={14} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">
                                            {inv.service_requests?.service_type === 'cleaning' ? 'Limpieza' :
                                                inv.service_requests?.service_type === 'maintenance' ? 'Mantenimiento' : 'Servicio'}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-0.5">{inv.service_requests?.properties?.title || 'Propiedad desconocida'}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    inv.status === 'unpaid' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                                }`}>
                                                {inv.status === 'paid' ? 'Pagado' : inv.status === 'unpaid' ? 'Pendiente' : inv.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                                <Calendar size={10} /> {format(new Date(inv.created_at), "d MMM yyyy", { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">{formatCurrency(inv.amount)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
}
