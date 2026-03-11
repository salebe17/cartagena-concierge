"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, User, Settings, Bell } from "lucide-react";
import { motion } from "framer-motion";

export function ClientNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/client/dashboard", icon: Home },
        { name: "New Request", href: "/client/request/new", icon: PlusSquare },
        { name: "Notifications", href: "/client/notifications", icon: Bell },
        { name: "Settings", href: "/client/settings", icon: Settings },
    ];

    return (
        <>
            {/* Mobile Bottom Navigation (Floating Glass) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:hidden z-50">
                <div className="glass rounded-full px-6 py-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/client/dashboard' && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                            <Link key={item.name} href={item.href} className="relative group flex flex-col items-center">
                                <div className={`relative p-2 rounded-2xl transition-all duration-300 ${isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:text-white"}`}>
                                    <Icon className="w-6 h-6 z-10 relative" />
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav-mobile"
                                            className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-xl blur-md"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Side Navigation */}
            <div className="hidden sm:flex flex-col w-64 fixed h-screen left-0 top-0 border-r border-white/5 bg-black/20 backdrop-blur-3xl z-40 p-6">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-[var(--color-primary)] flex items-center justify-center text-black font-bold text-xl shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                        F
                    </div>
                    <span className="font-extrabold tracking-widest text-lg text-white">FAIRBID</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/client/dashboard' && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                            <Link key={item.name} href={item.href} className="block w-full">
                                <div className={`relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-medium" : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(198,255,0,0.8)]" : ""}`} />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav-desktop"
                                            className="absolute left-0 w-1 h-8 bg-[var(--color-primary)] rounded-r-full shadow-[0_0_10px_var(--color-primary)]"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <div className="glass rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 flex items-center justify-center border border-white/10">
                            <User className="w-5 h-5 text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">Client Profile</p>
                            <p className="text-xs text-[var(--color-text-secondary)] truncate">Manage Details</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
