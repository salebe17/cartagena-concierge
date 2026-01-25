"use client";

import { useEffect, useState } from "react";
import { Monitor, Move, Layers, EyeOff, Eye } from "lucide-react";

export function LayoutDebugWidget() {
    const [mounted, setMounted] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [scroll, setScroll] = useState(0);
    const [debugOutlines, setDebugOutlines] = useState(false);
    const [breakpoint, setBreakpoint] = useState("xs");
    const [minimized, setMinimized] = useState(false);

    useEffect(() => {
        setMounted(true);

        const updateMetrics = () => {
            const w = window.innerWidth;
            setDimensions({ width: w, height: window.innerHeight });
            setScroll(window.scrollY);

            // Determine Tailwind-like breakpoint
            if (w >= 1536) setBreakpoint("2xl");
            else if (w >= 1280) setBreakpoint("xl");
            else if (w >= 1024) setBreakpoint("lg");
            else if (w >= 768) setBreakpoint("md");
            else if (w >= 640) setBreakpoint("sm");
            else setBreakpoint("xs");
        };

        updateMetrics();
        window.addEventListener("resize", updateMetrics);
        window.addEventListener("scroll", updateMetrics);

        return () => {
            window.removeEventListener("resize", updateMetrics);
            window.removeEventListener("scroll", updateMetrics);
        };
    }, []);

    // Inject CSS for outlines when enabled
    useEffect(() => {
        if (debugOutlines) {
            const style = document.createElement("style");
            style.id = "debug-outlines";
            style.innerHTML = `
        * { outline: 1px solid rgba(255, 0, 0, 0.25) !important; }
        * { background: rgba(255, 0, 0, 0.02) !important; }
        .layout-debug-widget, .layout-debug-widget * { outline: none !important; background: transparent !important; }
        .layout-debug-widget { background: #111827 !important; }
      `;
            document.head.appendChild(style);
        } else {
            const existing = document.getElementById("debug-outlines");
            if (existing) existing.remove();
        }
    }, [debugOutlines]);

    if (!mounted) return null;

    if (minimized) {
        return (
            <button
                onClick={() => setMinimized(false)}
                className="layout-debug-widget fixed bottom-4 right-4 z-[9999] bg-gray-900 text-cyan-400 p-3 rounded-full shadow-2xl border border-gray-700 hover:scale-110 transition-transform"
            >
                <Monitor size={20} />
            </button>
        );
    }

    return (
        <div className="layout-debug-widget fixed bottom-4 right-4 z-[9999] bg-gray-900/95 backdrop-blur-md text-gray-300 p-4 rounded-xl shadow-2xl border border-gray-700 w-64 font-mono text-xs transition-all animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-white flex items-center gap-2">
                    <Monitor size={14} className="text-cyan-400" /> UI INSPECTOR
                </span>
                <button onClick={() => setMinimized(true)} className="hover:text-white">
                    <Move size={14} />
                </button>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span>Viewport</span>
                    <span className="text-white font-bold">{dimensions.width}px × {dimensions.height}px</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span>Breakpoint</span>
                    <span className="text-yellow-400 font-bold uppercase">{breakpoint}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span>Scroll Y</span>
                    <span className="text-blue-400 font-bold">{Math.round(scroll)}px</span>
                </div>
            </div>

            <button
                onClick={() => setDebugOutlines(!debugOutlines)}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors ${debugOutlines ? "bg-red-500/20 text-red-400 border border-red-500/50" : "bg-gray-800 hover:bg-gray-700 text-white"
                    }`}
            >
                {debugOutlines ? <Eye size={14} /> : <EyeOff size={14} />}
                {debugOutlines ? "DISABLE X-RAY" : "ENABLE X-RAY"}
            </button>

            <div className="mt-3 text-[10px] text-gray-500 text-center">
                Use X-Ray to find overflow/alignment issues.
            </div>
        </div>
    );
}
