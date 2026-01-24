
"use client";

import { useState } from "react";
import { AlertCircle, X, CheckCircle, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { markAlertRead } from "@/app/actions/dashboard";

export interface AlertItem {
    id: string;
    title: string;
    message: string;
    type: 'pending_service' | 'info' | 'warning';
    created_at: string;
}

export function AlertWidget({ initialAlerts }: { initialAlerts: AlertItem[] }) {
    const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
    const [isOpen, setIsOpen] = useState(true);

    if (alerts.length === 0) return null;

    const handleDismiss = async (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        await markAlertRead(id);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                    <Bell size={18} className="fill-rose-100" />
                    <span>Novedades Pendientes ({alerts.length})</span>
                </div>
            </div>

            <div className="grid gap-3">
                <AnimatePresence>
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`relative p-4 rounded-xl border-l-4 shadow-sm bg-white ${alert.type === 'pending_service' ? 'border-l-orange-500' : 'border-l-blue-500'
                                }`}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        {alert.type === 'pending_service' && <AlertCircle size={14} className="text-orange-500" />}
                                        {alert.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                                        {alert.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {new Date(alert.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDismiss(alert.id)}
                                    className="text-gray-400 hover:text-gray-900 p-1 hover:bg-gray-50 rounded-full transition-colors"
                                >
                                    <CheckCircle size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
