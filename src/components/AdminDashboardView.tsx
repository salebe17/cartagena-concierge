"use client";

import { ActionResponse, ServiceRequest, StaffMember } from '@/lib/types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Wrench, Ship, Clock, RefreshCw, CheckCircle2, User, Home, UserPlus, ExternalLink, Calendar as CalendarIcon, Copy, Users, Check, CreditCard, Loader2, X, TrendingUp, DollarSign, Wallet, MapPin } from 'lucide-react';
import { Button } from "./ui/button";
import { RequestDetailsModal } from "./dashboard/RequestDetailsModal";
import { CalendarGrid } from "./admin/CalendarGrid";
import { LogDetailsModal } from "./dashboard/LogDetailsModal";
import { StaffManagementView } from "./admin/StaffManagementView";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminChatInbox } from "./chat/AdminChatInbox";
import { MessageSquare as MessageIcon } from "lucide-react";

import { getAdminSystemStatus } from "@/app/actions/debug";
import { DiagnosticOverlay } from "./debug/DiagnosticOverlay";

function StatsOverview({ requests = [], staff = [] }: { requests: ServiceRequest[], staff: StaffMember[] }) {
    const safeRequests = (requests || []);

    // LEVEL 23: Memoize expensive aggregations
    const { pending, active, completed } = React.useMemo(() => {
        return {
            pending: safeRequests.filter(r => r && r.status === 'pending').length,
            active: safeRequests.filter(r => r && r.status === 'confirmed').length,
            completed: safeRequests.filter(r => r && r.status === 'completed').length
        };
    }, [safeRequests]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm transition-all hover:scale-[1.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Pendientes</p>
                <p className="text-3xl font-black text-gray-900">{pending}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm transition-all hover:scale-[1.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Confirmados</p>
                <p className="text-3xl font-black text-blue-600">{active}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm transition-all hover:scale-[1.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Completados</p>
                <p className="text-3xl font-black text-emerald-600">{completed}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm transition-all hover:scale-[1.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Staff</p>
                <p className="text-3xl font-black text-gray-900">{staff.length}</p>
            </div>
        </div>
    );
}

function DebugStatusWidget() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {
        setLoading(true);
        const data = await getAdminSystemStatus();
        setStatus(data);
        setLoading(false);
    };

    return (
        <div className="bg-gray-900 rounded-2xl p-4 text-xs font-mono text-gray-300 overflow-hidden border border-gray-800">
            <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                <span className="font-bold text-white uppercase tracking-wider">Diagnóstico de Sistema</span>
                <button onClick={checkStatus} className="text-cyan-400 hover:text-cyan-300 underline">
                    {loading ? "Verificando..." : "Ejecutar"}
                </button>
            </div>
            {status ? (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-500 block">Entorno</span>
                            <span className={status.env.hasServiceKey ? "text-emerald-400" : "text-red-400"}>
                                Service Key: {status.env.hasServiceKey ? "OK" : "FALTA"}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Auth</span>
                            <span>Usuario: {status.auth.userId ? status.auth.userId.slice(0, 8) + '...' : 'Ninguno'}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-gray-600 italic">
                    Click "Ejecutar" para verificar persistencia.
                </div>
            )}
        </div>
    );
}

interface AdminDashboardViewProps {
    requests: ServiceRequest[];
    bookings?: any[];
}

function FinanceView({ currency }: { currency: 'COP' | 'USD' }) {
    const [stats, setStats] = useState<any>(null);
    const [propRevenue, setPropRevenue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const EX_RATE = 4000;

    const format = (amt: number) => {
        const val = currency === 'USD' ? amt / EX_RATE : amt;
        const numStr = mounted ? Math.round(val).toLocaleString() : '---';
        return (currency === 'USD' ? '$' : '$') + numStr + (currency === 'USD' ? ' USD' : '');
    };

    useEffect(() => {
        const load = async () => {
            try {
                // BYPASS STRATEGY: API Route for Finance
                const res = await fetch('/api/admin/finance');
                if (res.ok) {
                    const json = await res.json();
                    if (json.success) {
                        setStats(json.data.stats);
                        setPropRevenue(json.data.propertyRevenue);
                    }
                }
            } catch (e) {
                console.error("Failed to load finance stats", e);
            } finally {
                setLoading(false);
                setMounted(true);
            }
        };
        load();
    }, []);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gray-300" size={40} /></div>;
    if (!stats) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign size={80} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Ingresos Totales ({currency})</p>
                    <p className="text-4xl font-black text-emerald-600">{format(stats.total)}</p>
                </div>

                <div className="bg-gray-950 p-6 rounded-3xl shadow-xl relative overflow-hidden text-white md:col-span-2">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Distribución por Servicio</p>
                            <h3 className="text-xl font-bold">Performance de Misiones</h3>
                        </div>
                        <Wallet className="text-gray-700" size={32} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {['cleaning', 'maintenance', 'concierge'].map(type => (
                            <div key={type} className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-gray-500 truncate">{type}</p>
                                <p className="text-lg font-black">{format(stats.byService[type] || 0)}</p>
                                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                        style={{ width: `${stats.total > 0 ? (stats.byService[type] / stats.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                        <Home size={16} className="text-rose-500" /> Ingresos por Propiedad
                    </h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {propRevenue.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <p className="text-xs font-bold uppercase tracking-widest">Sin datos financieros aún</p>
                        </div>
                    ) : (
                        propRevenue.map((prop, idx) => (
                            <div key={prop.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:bg-rose-500 group-hover:text-white transition-all text-xs">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{prop.title}</p>
                                        <p className="text-[10px] text-gray-400">ID: {prop.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <p className="text-lg font-black text-gray-900">{format(prop.revenue)}</p>
                            </div>
                        )))}
                </div>
            </div>
        </div>
    );
}

export function AdminDashboardView({ requests: initialRequests, bookings: initialBookings = [] }: AdminDashboardViewProps) {
    const [requests, setRequests] = useState<ServiceRequest[]>((initialRequests || []).filter(r => r && typeof r === 'object'));
    const [bookings, setBookings] = useState<any[]>(initialBookings || []);
    const [loadingData, setLoadingData] = useState(true);

    // ... existing state ...
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState<'requests' | 'calendar' | 'staff' | 'finance' | 'inbox'>('requests');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [filterPropertyId, setFilterPropertyId] = useState<string | null>(null);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isCharging, setIsCharging] = useState<string | null>(null);
    const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
    const { toast } = useToast();

    useEffect(() => {
        setMounted(true);
        const init = async () => {
            // 1. Auth check
            const supabase = createBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            // 2. Fetch Data (API Routes)
            try {
                const [reqRes, bookRes, staffRes] = await Promise.all([
                    fetch('/api/admin/requests'),
                    fetch('/api/admin/bookings'),
                    fetch('/api/admin/staff')
                ]);

                if (reqRes.ok) {
                    const json = await reqRes.json();
                    if (json.success) setRequests(json.data);
                }
                if (bookRes.ok) {
                    const json = await bookRes.json();
                    if (json.success) setBookings(json.data);
                }
                if (staffRes.ok) {
                    const json = await staffRes.json();
                    if (json.success) setStaffList(json.data);
                }
            } catch (err) {
                console.error("Dashboard Init Error:", err);
            } finally {
                setLoadingData(false);
            }
        };
        init();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/admin/staff');
            if (res.ok) {
                const json = await res.json();
                if (json.success) setStaffList(json.data);
            }
        } catch (e) {
            console.error("Staff Fetch Error", e);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/sync-calendar', {
                method: 'POST'
            });
            const json = await res.json();

            if (json.success) {
                toast({ title: "Sincronización Completada", description: json.message });
            } else {
                toast({ title: "Error", description: json.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error de Conexión", variant: "destructive" });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id);

        try {
            const res = await fetch('/api/admin/requests/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });

            const json = await res.json();

            if (json.success) {
                setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
                toast({ title: "Estado Actualizado (API)" });
            } else {
                toast({ title: "Error", description: json.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error de Conexión", variant: "destructive" });
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAssignStaff = async (requestId: string, staffId: string) => {
        try {
            const res = await fetch('/api/admin/requests/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, staffId })
            });
            const json = await res.json();

            if (json.success) {
                setRequests(prev => prev.map(r => r.id === requestId ? { ...r, assigned_staff_id: staffId } : r));
                toast({ title: "Staff Asignado" });
            } else {
                toast({ title: "Error", description: json.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error de Conexión", variant: "destructive" });
        }
    };

    const handleCharge = async (requestId: string) => {
        setIsCharging(requestId);
        try {
            const res = await fetch('/api/admin/billing/charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });
            const json = await res.json();

            if (json.success) {
                toast({ title: "Pago Procesado" });
            } else {
                toast({ title: "Error", description: json.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error de Conexión", variant: "destructive" });
        } finally {
            setIsCharging(null);
        }
    };

    const handleScheduleCleaning = async (booking: any) => {
        try {
            const res = await fetch('/api/admin/requests/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    property_id: booking.property_id,
                    service_type: 'cleaning',
                    notes: `Limpieza automatica salida: ${booking.guest_name}`,
                    requested_date: new Date(booking.end_date).toISOString()
                })
            });
            const json = await res.json();

            if (json.success && json.data) {
                setRequests(prev => [json.data, ...prev]);
                toast({ title: "Limpieza Programada" });
            } else {
                toast({ title: "Error", description: json.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error de Conexión", variant: "destructive" });
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'cleaning': return <Sparkles size={20} className="text-rose-500" />
            case 'maintenance': return <Wrench size={20} className="text-blue-500" />
            case 'concierge': return <Ship size={20} className="text-cyan-500" />
            default: return <Clock size={20} className="text-gray-400" />
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const handleViewCalendar = (propertyId: string) => {
        setFilterPropertyId(propertyId);
        setActiveTab('calendar');
    };

    const filteredBookings = filterPropertyId ? bookings.filter(b => b.property_id === filterPropertyId) : bookings;

    if (loadingData && requests.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-blue-900" size={48} />
                    <p className="text-gray-500 font-medium animate-pulse">Cargando Panel de Control...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Centro de Comando</h1>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{requests.length} Solicitudes Activas</p>
                    </div>
                    <Button onClick={handleSync} disabled={isSyncing} variant="outline" className="rounded-2xl">
                        <RefreshCw size={14} className={isSyncing ? "animate-spin mr-2" : "mr-2"} /> Sincronizar
                    </Button>
                </div>

                <StatsOverview requests={requests} staff={staffList} />

                <div className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md pt-4 flex justify-between items-end border-b border-gray-200">
                    <div className="flex gap-6">
                        {['solicitudes', 'calendario', 'personal', 'finanzas', 'mensajes'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab === 'solicitudes' ? 'requests' : tab === 'calendario' ? 'calendar' : tab === 'personal' ? 'staff' : tab === 'finanzas' ? 'finance' : 'inbox')}
                                className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${(activeTab === 'requests' && tab === 'solicitudes') ||
                                    (activeTab === 'calendar' && tab === 'calendario') ||
                                    (activeTab === 'staff' && tab === 'personal') ||
                                    (activeTab === 'finance' && tab === 'finanzas') ||
                                    (activeTab === 'inbox' && tab === 'mensajes')
                                    ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-gray-200 p-1 rounded-xl text-[10px] font-black mb-3">
                        <button onClick={() => setCurrency('COP')} className={`px-2 py-1 rounded-lg ${currency === 'COP' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>COP</button>
                        <button onClick={() => setCurrency('USD')} className={`px-2 py-1 rounded-lg ${currency === 'USD' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>USD</button>
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'requests' ? (
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {requests.map((req, index) => {
                                    if (!req || !req.id) return null;
                                    return (
                                        <motion.div
                                            key={req.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row group"
                                        >
                                            <div className="p-6 flex items-start gap-4 flex-1">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-110 transition-transform">
                                                    {getIcon(req.service_type)}
                                                </div>
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(req.status)}`}>{req.status}</span>
                                                        <span className="text-[10px] text-gray-300 font-mono">#{req.id.slice(0, 5)}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-gray-900 leading-none">{req.service_type === 'cleaning' ? 'Limpieza de Unidad' : 'Servicio Especial'}</h3>

                                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-[13px] font-black text-gray-900 flex items-center gap-1.5"><Home size={14} className="text-rose-500" /> {req.properties?.title}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><MapPin size={10} /> {req.properties?.address || 'Cartagena'}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between border-l border-gray-200 pl-4">
                                                            <div>
                                                                <p className="text-[9px] font-black text-gray-400 uppercase">{mounted && req.requested_date ? new Date(req.requested_date).toLocaleDateString() : '--/--/----'}</p>
                                                                <p className="text-xs font-bold text-gray-800">Fecha Misi&oacute;n</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setActiveTab('inbox')}
                                                                aria-label="Abrir Chat"
                                                                className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors shadow-sm"
                                                            >
                                                                <MessageIcon size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Users size={12} className="text-gray-400" />
                                                        <select
                                                            value={req.assigned_staff_id || ""}
                                                            onChange={(e) => handleAssignStaff(req.id, e.target.value)}
                                                            aria-label="Asignar Staff"
                                                            className="text-[11px] font-bold border-none bg-transparent p-0 focus:ring-0 text-gray-500 cursor-pointer"
                                                        >
                                                            <option value="">Asignar Personal...</option>
                                                            {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50/50 p-6 border-l border-gray-100 flex flex-col justify-center gap-3 min-w-[220px]">
                                                {req.status === 'pending' && <Button onClick={() => handleStatusUpdate(req.id, 'confirmed')} className="w-full bg-blue-600 font-bold rounded-xl h-11">Confirmar</Button>}
                                                {req.status === 'confirmed' && <Button onClick={() => handleStatusUpdate(req.id, 'completed')} className="w-full bg-emerald-600 font-bold rounded-xl h-11">Finalizar</Button>}
                                                {req.status === 'completed' && <Button onClick={() => handleCharge(req.id)} className="w-full bg-gray-950 font-bold rounded-xl h-11">Cobrar</Button>}

                                                <div className="flex gap-2">
                                                    <RequestDetailsModal request={req} onViewCalendar={handleViewCalendar} triggerButton={<Button variant="ghost" className="flex-1 text-[10px] font-bold">INFO</Button>} />
                                                    <LogDetailsModal request={req} triggerButton={<Button variant="ghost" className="flex-1 text-[10px] font-bold text-emerald-600">LOGS</Button>} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {requests.length === 0 && <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 font-bold">Sin solicitudes pendientes.</div>}
                            <DebugStatusWidget />
                            <DiagnosticOverlay />
                        </div>
                    ) : activeTab === 'calendar' ? (
                        <CalendarGrid bookings={filteredBookings} onScheduleCleaning={handleScheduleCleaning} />
                    ) : activeTab === 'staff' ? (
                        <StaffManagementView />
                    ) : activeTab === 'finance' ? (
                        <FinanceView currency={currency} />
                    ) : activeTab === 'inbox' && currentUser ? (
                        <AdminChatInbox currentUserId={currentUser.id} />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
