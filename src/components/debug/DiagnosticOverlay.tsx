"use client";

import { useState, useEffect } from "react";
import { getStaffMembers } from "@/app/admin/actions/staff_management";
import { getAllServiceRequests } from "@/app/actions/admin";
import { Bug, X, RefreshCw, Activity, Database, AlertCircle } from "lucide-react";

export function DiagnosticOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [staffTestResult, setStaffTestResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [envStatus, setEnvStatus] = useState<any>(null);

    // Capture global errors
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            addLog(`❌ ERROR: ${event.message} at ${event.filename}:${event.lineno}`);
        };
        const handleRejection = (event: PromiseRejectionEvent) => {
            addLog(`❌ UNHANDLED PROMISE: ${event.reason?.message || event.reason}`);
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleRejection);

        return () => {
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleRejection);
        };
    }, []);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    };

    const runStaffTest = async () => {
        setLoading(true);
        addLog("🚀 Testing getStaffMembers()...");
        try {
            const start = performance.now();
            const res = await getStaffMembers();
            const end = performance.now();

            if (res.success) {
                addLog(`✅ Success (${(end - start).toFixed(0)}ms). Items: ${res.data?.length}`);
                setStaffTestResult({ status: "OK", count: res.data?.length, sample: res.data?.[0] || "None" });
            } else {
                addLog(`🔥 Server Error: ${res.error}`);
                setStaffTestResult({ status: "ERROR", error: res.error });
            }
        } catch (e: any) {
            addLog(`💀 Client Catch: ${e.message}`);
            setStaffTestResult({ status: "CRASH", error: e.message });
        }
        setLoading(false);
    };

    const runRequestTest = async () => {
        setLoading(true);
        addLog("🚀 Testing getAllServiceRequests()...");
        try {
            const res = await getAllServiceRequests();
            addLog(`✅ Requests Fetched: ${res?.length} items.`);
        } catch (e: any) {
            addLog(`💀 Request Fetch Failed: ${e.message}`);
        }
        setLoading(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-rose-600 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform animate-pulse"
                title="Abrir Diagnóstico"
            >
                <Bug size={24} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-gray-950 text-gray-200 w-full max-w-4xl h-[80vh] rounded-3xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                    <div className="flex items-center gap-2">
                        <Activity className="text-emerald-500" size={16} />
                        <h2 className="font-bold text-white text-sm uppercase tracking-widest">Diagnostic Console v1.0</h2>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
                    {/* Controls Panel */}
                    <div className="p-6 border-r border-gray-800 space-y-6 overflow-y-auto">
                        <div className="space-y-2">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Database size={14} className="text-blue-400" /> Actions Test
                            </h3>
                            <button
                                onClick={runStaffTest}
                                disabled={loading}
                                className="w-full bg-blue-900/30 border border-blue-800 hover:bg-blue-900/50 text-blue-100 p-3 rounded-xl text-left flex justify-between items-center transition-colors"
                            >
                                <span>Test getStaffMembers()</span>
                                {loading && <RefreshCw className="animate-spin" size={14} />}
                            </button>

                            <button
                                onClick={runRequestTest}
                                disabled={loading}
                                className="w-full bg-emerald-900/30 border border-emerald-800 hover:bg-emerald-900/50 text-emerald-100 p-3 rounded-xl text-left flex justify-between items-center transition-colors"
                            >
                                <span>Test getAllServiceRequests()</span>
                            </button>
                        </div>

                        {staffTestResult && (
                            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                                <h4 className="font-bold text-gray-400 mb-2">Last Test Result</h4>
                                <pre className="text-[10px] bg-black p-2 rounded border border-gray-800 overflow-x-auto text-green-400">
                                    {JSON.stringify(staffTestResult, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="p-4 bg-amber-900/20 border border-amber-900/50 rounded-xl">
                            <h4 className="font-bold text-amber-500 flex items-center gap-2 mb-1">
                                <AlertCircle size={14} /> Browser Env
                            </h4>
                            <p>User Agent: {typeof navigator !== "undefined" ? navigator.userAgent : "SSR"}</p>
                            <p className="mt-1">Viewport: {typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "SSR"}</p>
                        </div>
                    </div>

                    {/* Console Output */}
                    <div className="bg-black p-4 overflow-y-auto font-mono flex flex-col-reverse">
                        {logs.length === 0 && <span className="text-gray-600 italic text-center mt-10">Waiting for logs...</span>}
                        {logs.map((log, i) => (
                            <div key={i} className="border-b border-gray-900 py-1 break-words">
                                <span className={log.includes("❌") ? "text-rose-400 font-bold" : log.includes("✅") ? "text-emerald-400" : "text-gray-400"}>
                                    {log}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
