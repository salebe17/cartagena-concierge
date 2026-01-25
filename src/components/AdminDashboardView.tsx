"use client";

import { ActionResponse, ServiceRequest } from '@/lib/types';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { adminUpdateServiceStatus, forceSyncAllCalendars, adminCreateServiceRequest, assignStaffToRequest, getFinancialStats, getRevenueByProperty } from '@/app/actions/admin';
import { getStaffMembers, StaffMember } from '@/app/admin/actions/staff_management';
import { chargeServiceRequest } from '@/app/actions/billing';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Wrench, Ship, Clock, RefreshCw, CheckCircle2, User, Home, UserPlus, ExternalLink, Calendar as CalendarIcon, Copy, Users, Check, CreditCard, Loader2, X, TrendingUp, DollarSign, Wallet, MapPin } from 'lucide-react';
import { Button } from "./ui/button";
import { RequestDetailsModal } from "./dashboard/RequestDetailsModal";
import { CalendarGrid } from "./admin/CalendarGrid";
import { LogDetailsModal } from "./dashboard/LogDetailsModal";
import { StaffManagementView } from "./admin/StaffManagementView";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminChatInbox } from "./chat/AdminChatInbox";
import { MessageSquare as MessageIcon } from "lucide-react";

import { getAdminSystemStatus } from "@/app/actions/debug";

function StatsOverview({ requests, staff }: { requests: ServiceRequest[], staff: StaffMember[] }) {
    const pending = requests.filter(r => r.status === 'pending').length;
    const active = requests.filter(r => r.status === 'confirmed').length;
    const completed = requests.filter(r => r.status === 'completed').length;

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
                <span className="font-bold text-white uppercase tracking-wider">System Diagnostic</span>
                <button onClick={checkStatus} className="text-cyan-400 hover:text-cyan-300 underline">
                    {loading ? "Checking..." : "Run Check"}
                </button>
            </div>
            {status ? (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-500 block">Environment</span>
                            <span className={status.env.hasServiceKey ? "text-emerald-400" : "text-red-400"}>
                                Service Key: {status.env.hasServiceKey ? "OK" : "MISSING"}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Auth</span>
                            <span>User: {status.auth.userId ? status.auth.userId.slice(0, 8) + '...' : 'None'}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-gray-600 italic">
                    Click "Run Check" to verify persistence issues.
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

    const EX_RATE = 4000;

    const format = (amt: number) => {
        const val = currency === 'USD' ? amt / EX_RATE : amt;
        return (currency === 'USD' ? '$' : '$') + Math.round(val).toLocaleString() + (currency === 'USD' ? ' USD' : '');
    };

    useEffect(() => {
        const load = async () => {
            const [s, p] = await Promise.all([getFinancialStats(), getRevenueByProperty()]);
            setStats(s);
            setPropRevenue(p);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gray-300" size={40} /></div>;

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
                                        style={{ width: `${(stats.byService[type] / stats.total) * 100 || 0}%` }}
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
                    {propRevenue.map((prop, idx) => (
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
                    ))}
                </div>
            </div>
        </div>
    );
}

export function AdminDashboardView({ requests: initialRequests, bookings = [] }: AdminDashboardViewProps) {
    const [requests, setRequests] = useState<any[]>(initialRequests || []);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState<'requests' | 'calendar' | 'staff' | 'finance' | 'inbox'>('requests');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [filterPropertyId, setFilterPropertyId] = useState<string | null>(null);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [isCharging, setIsCharging] = useState<string | null>(null);
    const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
    const { toast } = useToast();

    useEffect(() => {
        const getU = async () => {
            const supabase = createBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getU();
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        const res = await getStaffMembers();
        if (res.success && res.data) setStaffList(res.data);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        const res = await forceSyncAllCalendars();
        setIsSyncing(false);
        if (res.success) toast({ title: "Sincronización Completada" });
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        const res = await adminUpdateServiceStatus(id, newStatus);
        setUpdatingId(null);
        if (!res.error) {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
            toast({ title: "Estado Actualizado" });
        }
    };

    const handleAssignStaff = async (requestId: string, staffId: string) => {
        const res = await assignStaffToRequest(requestId, staffId);
        if (res.success) {
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, assigned_staff_id: staffId } : r));
            toast({ title: "Staff Asignado" });
        }
    };

    const handleCharge = async (requestId: string) => {
        setIsCharging(requestId);
        const res = await chargeServiceRequest(requestId);
        setIsCharging(null);
        if (res.success) toast({ title: "Pago Procesado" });
    };

    const handleScheduleCleaning = async (booking: any) => {
        const res = await adminCreateServiceRequest({
            property_id: booking.property_id,
            service_type: 'cleaning',
            notes: `Limpieza automatica salida: ${booking.guest_name}`,
            requested_date: new Date(booking.end_date).toISOString()
        });
        if (res.success && res.data) setRequests(prev => [res.data, ...prev]);
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

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Command Center</h1>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{requests.length} Solicitudes Activas</p>
                    </div>
                    <Button onClick={handleSync} disabled={isSyncing} variant="outline" className="rounded-2xl">
                        <RefreshCw size={14} className={isSyncing ? "animate-spin mr-2" : "mr-2"} /> Sincronizar
                    </Button>
                </div>

                <StatsOverview requests={requests} staff={staffList} />

                <div className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md pt-4 flex justify-between items-end border-b border-gray-200">
                    <div className="flex gap-6">
                        {['requests', 'calendar', 'staff', 'finance', 'inbox'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
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
                                {requests.map((req, index) => (
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
                                                            <p className="text-[9px] font-black text-gray-400 uppercase">{new Date(req.requested_date).toLocaleDateString()}</p>
                                                            <p className="text-xs font-bold text-gray-800">Fecha Misi&oacute;n</p>
                                                        </div>
                                                        <button onClick={() => setActiveTab('inbox')} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors shadow-sm">
                                                            <MessageIcon size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Users size={12} className="text-gray-400" />
                                                    <select
                                                        value={req.assigned_staff_id || ""}
                                                        onChange={(e) => handleAssignStaff(req.id, e.target.value)}
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
                                ))}
                            </AnimatePresence>
                            {requests.length === 0 && <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 font-bold">Sin solicitudes pendientes.</div>}
                            <DebugStatusWidget />
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
