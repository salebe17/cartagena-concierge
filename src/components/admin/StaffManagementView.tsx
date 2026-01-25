"use client";

import { useState, useEffect } from "react";
import {
    getStaffMembers,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
    StaffMember
} from "@/app/admin/actions/staff_management";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    User,
    Phone,
    Mail,
    Trash2,
    Plus,
    Loader2,
    Search,
    UserPlus,
    Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

function EfficiencyBadge({ minutes }: { minutes: number }) {
    if (minutes === 0) return null;
    const isFast = minutes < 45;
    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isFast ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
            {isFast ? '⚡ Alta Eficiencia' : '🕒 Ritmo Estándar'}
        </span>
    );
}

export function StaffManagementView() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newStaff, setNewStaff] = useState({
        full_name: "",
        role: "cleaner",
        phone: "",
        email: ""
    });
    const [mounted, setMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setMounted(true);
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await getStaffMembers();
            if (res.success && res.data) {
                setStaff(res.data);
            } else {
                toast({ title: "Error", description: res.error || "No se pudo cargar el personal", variant: "destructive" });
            }
        } catch (err: any) {
            console.error("Fetch Staff Client Error:", err);
            toast({ title: "Error Crítico", description: "Fallo de conexión al cargar staff", variant: "destructive" });
        }
        setLoading(false);
    };

    const handleAddStaff = async () => {
        if (!newStaff.full_name) {
            toast({ title: "Faltan datos", description: "El nombre es obligatorio.", variant: "destructive" });
            return;
        }
        setLoading(true);
        const res = await createStaffMember(newStaff);
        if (res.success) {
            toast({ title: "Staff agregado", description: `${newStaff.full_name} ahora es parte del equipo.` });
            setNewStaff({ full_name: "", role: "cleaner", phone: "", email: "" });
            setIsAdding(false);
            fetchStaff();
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar a ${name}?`)) return;
        const res = await deleteStaffMember(id);
        if (res.success) {
            toast({ title: "Staff eliminado", description: "Miembro removido correctamente." });
            fetchStaff();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                    <Input className="pl-10 h-10 rounded-xl" placeholder="Buscar staff..." />
                </div>
                <Button onClick={() => setIsAdding(true)} className="gap-2 bg-gray-900 text-white rounded-xl">
                    <UserPlus size={18} /> Nuevo Miembro
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                    >
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">Nombre Completo</Label>
                            <Input
                                value={newStaff.full_name}
                                onChange={e => setNewStaff({ ...newStaff, full_name: e.target.value })}
                                placeholder="Ej: María Pérez"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">Rol</Label>
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={newStaff.role}
                                onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                            >
                                <option value="cleaner">Limpieza</option>
                                <option value="maintenance">Mantenimiento</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="concierge">Concierge</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-gray-400">WhatsApp / Tel</Label>
                            <Input
                                value={newStaff.phone}
                                onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                                placeholder="+57..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleAddStaff} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                                Guardar
                            </Button>
                            <Button onClick={() => setIsAdding(false)} variant="ghost" className="text-gray-400">
                                <X size={18} />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && !isAdding ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gray-300" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.filter(m => m && m.id).map(member => (
                        <Card key={member.id} className="p-6 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{member.full_name}</h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            {member.role === 'cleaner' ? 'Limpieza' :
                                                member.role === 'maintenance' ? 'Mantenimiento' : member.role}
                                        </span>
                                        {member.metrics && <div className="mt-1"><EfficiencyBadge minutes={member.metrics.avgCompletionTimeMinutes || 0} /></div>}
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(member.id, member.full_name)} className="text-gray-300 hover:text-rose-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mt-6 space-y-3">
                                {member.phone && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone size={14} className="text-gray-300" />
                                        <span>{member.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Award size={14} className="text-amber-400" />
                                    <span className="font-bold">Rating: {mounted ? (member.rating || 0).toFixed(1) : "-.-"}</span>
                                </div>
                                {member.metrics && (
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                                            <span className="text-[8px] font-black uppercase text-gray-400 block leading-none mb-1">Misiones</span>
                                            <span className="text-sm font-black text-gray-900">{member.metrics.totalJobs || 0}</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase text-gray-400 block leading-none mb-1">Promedio</span>
                                        <span className="text-sm font-black text-gray-900">{mounted ? `${member.metrics.avgCompletionTimeMinutes || 0}m` : "--m"}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 font-medium">Estado: </span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase">{member.status || 'Active'}</span>
                            </div>
                        </Card>
                    ))}

                    {staff.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                            <User size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-medium">No hay miembros registrados aún.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`bg-white rounded-3xl border ${className}`}>
            {children}
        </div>
    )
}

function X({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
}
