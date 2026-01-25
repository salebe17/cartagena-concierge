"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react"; // Import compatible icons
import { motion, AnimatePresence } from "framer-motion";
import { ChatBox } from "./ChatBox";

interface FloatingChatWidgetProps {
    currentUserId: string;
    userName?: string;
}

export function FloatingChatWidget({ currentUserId, userName }: FloatingChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[90vw] md:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gray-900 text-white p-4 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-bold text-sm">Soporte Concierge</h3>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Estamos en línea</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ChatBox */}
                        <div className="flex-1 overflow-hidden relative">
                            <ChatBox
                                currentUserId={currentUserId}
                                userId={currentUserId} // Host is chatting as themselves
                                isAdmin={false}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors 
                    ${isOpen ? 'bg-gray-200 text-gray-800' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
                {/* Note: MessageCircle is standard lucide. Use MessageSquare if preferred */}

                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}
