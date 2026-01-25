"use client";

import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { startJob, finishJob, uploadEvidence } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check, Camera, Play, CheckCircle2, User, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";

// Mock Checklist for Demo
const TASKS = [
    { id: '1', label: 'Verificar nevera (Items olvidados)', zone: 'Cocina' },
    { id: '2', label: 'Sacar basura y cambiar bolsas', zone: 'Cocina' },
    { id: '3', label: 'Cambiar sábanas y toallas', zone: 'Habitaciones' },
    { id: '4', label: 'Limpiar espejos y grifería', zone: 'Baños' },
    { id: '5', label: 'Barrer y trapear pisos', zone: 'General' },
    { id: '6', label: 'Apagar luces y A/C', zone: 'Salida' },
];

export default function StaffJobPage() {
    const params = useParams();
    const requestId = params.requestId as string;
    const [step, setStep] = useState<'welcome' | 'checklist' | 'checkout' | 'success'>('welcome');
    const [staffName, setStaffName] = useState("");
    const [loading, setLoading] = useState(false);
    const [logId, setLogId] = useState<string | null>(null);
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    const [evidence, setEvidence] = useState<string[]>([]);

    // New Upload State
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { toast } = useToast();

    const handleStart = async () => {
        if (!staffName.trim()) {
            toast({ title: "Nombre requerido", description: "Por favor escribe tu nombre.", variant: "destructive" });
            return;
        }
        setLoading(true);
        const res = await startJob(params.requestId, staffName);
        setLoading(false);

        if (res.success && res.data) {
            setLogId(res.data.id);
            setStep('checklist');
        } else {
            toast({ title: "Error", description: res.error || "No se pudo iniciar.", variant: "destructive" });
        }
    };

    const toggleTask = (taskId: string) => {
        setCompletedTasks(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("requestId", requestId);

        const res = await uploadEvidence(formData);
        setUploading(false);

        // Clear input to allow re-uploading same file if needed
        if (fileInputRef.current) fileInputRef.current.value = "";

        if (res.success && res.data) {
            setEvidence(prev => [...prev, res.data.url]);
            toast({ title: "Foto subida", description: "Evidencia guardada correctamente." });
        } else {
            toast({ title: "Error", description: res.error || "Falló la subida.", variant: "destructive" });
        }
    };

    const handleFinish = async () => {
        if (!logId) return;
        setLoading(true);
        const res = await finishJob(logId, requestId, evidence);
        setLoading(false);

        if (res.success) {
            setStep('success');
        } else {
            toast({ title: "Error", description: res.error || "No se pudo finalizar.", variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-black text-white p-6 shadow-lg">
                <h1 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Staff Portal
                </h1>
                <p className="text-gray-400 text-xs mt-1">ID Misión: {requestId ? requestId.slice(0, 6) : "..."}</p>
            </div>

            <main className="flex-1 p-6 max-w-md mx-auto w-full">
                <AnimatePresence mode="wait">

                    {/* STEP 1: WELCOME */}
                    {step === 'welcome' && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <Card className="p-6 border-0 shadow-xl rounded-3xl bg-white/80 backdrop-blur">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Nueva Asignación</h2>
                                    <p className="text-gray-500">Cartagena Concierge requiere tu servicio.</p>
                                </div>
                                <div className="mt-8 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-400">Tu Nombre</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-gray-300" size={18} />
                                            <Input
                                                className="pl-10 h-12 rounded-xl text-lg font-medium"
                                                placeholder="Ej. María Pérez"
                                                value={staffName}
                                                onChange={(e) => setStaffName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full h-14 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg active:scale-95 transition-all"
                                        onClick={handleStart}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <><Play size={20} className="mr-2" /> INICIAR TRABAJO</>}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 2: CHECKLIST */}
                    {step === 'checklist' && (
                        <motion.div
                            key="checklist"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Tareas</h3>
                                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                                    {completedTasks.length}/{TASKS.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {TASKS.map((task) => (
                                    <motion.button
                                        key={task.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => toggleTask(task.id)}
                                        className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all shadow-sm ${completedTasks.includes(task.id)
                                            ? 'bg-emerald-50 border-emerald-100 ring-1 ring-emerald-200'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${completedTasks.includes(task.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                                            }`}>
                                            {completedTasks.includes(task.id) && <Check size={14} strokeWidth={4} />}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${completedTasks.includes(task.id) ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {task.label}
                                            </p>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                {task.zone}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Button
                                    className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-xl font-bold shadow-xl active:scale-95 transition-all"
                                    onClick={() => setStep('checkout')}
                                    disabled={completedTasks.length < TASKS.length}
                                >
                                    Siguiente Paso
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: CHECKOUT */}
                    {step === 'checkout' && (
                        <motion.div
                            key="checkout"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="text-center py-6">
                                <h3 className="text-2xl font-bold text-gray-900">Evidencia Final</h3>
                                <p className="text-gray-500 text-sm">Toma una foto del resultado final.</p>
                            </div>

                            <div
                                onClick={handlePhotoClick}
                                className="border-3 border-dashed border-gray-200 rounded-3xl h-64 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 active:scale-95 transition-all relative overflow-hidden"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                />

                                {uploading ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                        <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
                                        <p className="text-gray-400 font-medium">Subiendo...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-900 mb-4">
                                            <Camera size={32} />
                                        </div>
                                        <p className="font-bold text-gray-500">Tocar para tomar foto</p>
                                    </>
                                )}

                                {evidence.length > 0 && (
                                    <div className="absolute bottom-4 left-0 right-0 text-center">
                                        <p className="text-emerald-600 font-bold text-sm bg-emerald-50 inline-block px-3 py-1 rounded-full">{evidence.length} Fotos Guardadas</p>
                                    </div>
                                )}
                            </div>

                            <Button
                                className="w-full h-14 text-lg font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-lg active:scale-95 transition-all"
                                onClick={handleFinish}
                                disabled={loading || evidence.length === 0}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "FINALIZAR SERVICIO"}
                            </Button>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-6 py-12"
                        >
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={48} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900">¡Gran Trabajo!</h2>
                                <p className="text-gray-500 mt-2">El servicio ha sido registrado exitosamente.</p>
                            </div>
                            <div className="pt-8">
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Cartagena Concierge Staff</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
