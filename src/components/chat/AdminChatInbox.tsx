'use client'

import { useState, useEffect } from 'react';
import { getAdminInbox } from '@/app/actions/chat';
import { ChatBox } from './ChatBox';
import { MessageSquare, Clock, Home, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminChatInbox({ currentUserId }: { currentUserId: string }) {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const refresh = async () => {
        try {
            const res = await fetch('/api/admin/chat/inbox');
            if (res.ok) {
                const json = await res.json();
                if (json.success) setConversations(json.data);
            }
        } catch (e) {
            console.error("Inbox Poll Error:", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        refresh();
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading && conversations.length === 0) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gray-300" /></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 h-[600px]">
            {/* Sidebar: Conversations List */}
            <div className={`md:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Mensajes</h3>
                    <MessageSquare size={14} className="text-gray-300" />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConv(conv)}
                            className={`w-full text-left p-4 p-4 border-b border-gray-50 transition-all hover:bg-gray-50 ${selectedConv?.id === conv.id ? 'bg-rose-50 border-l-4 border-l-rose-500' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-bold text-gray-900 truncate pr-2">{conv.senderName}</p>
                                <span className="text-[9px] font-bold text-gray-400 shrink-0">
                                    {mounted ? new Date(conv.timestamp).toLocaleDateString() : '--/--/----'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                                <Home size={10} className="text-gray-400" />
                                <p className="text-[10px] text-gray-500 font-medium truncate">{conv.propertyTitle}</p>
                            </div>
                            <p className={`text-xs truncate ${conv.unread ? 'font-black text-gray-900' : 'text-gray-400'}`}>
                                {conv.lastMessage}
                            </p>
                            {conv.unread && (
                                <div className="mt-2 w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-200" />
                            )}
                        </button>
                    ))}
                    {conversations.length === 0 && (
                        <div className="p-8 text-center text-gray-300 italic text-xs">No hay conversaciones activas.</div>
                    )}
                </div>
            </div>

            {/* Main: Active Chat */}
            <div className={`md:col-span-2 ${!selectedConv ? 'hidden md:flex items-center justify-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200' : 'flex flex-col'}`}>
                {selectedConv ? (
                    <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden">
                                    <ArrowLeft size={18} />
                                </button>
                                <div>
                                    <p className="text-sm font-bold">{selectedConv.senderName}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{selectedConv.propertyTitle}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatBox
                                requestId={selectedConv.isRequest ? selectedConv.id : undefined}
                                userId={!selectedConv.isRequest ? selectedConv.chatPartnerId : undefined}
                                currentUserId={currentUserId}
                                isAdmin={true}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-gray-200 shadow-sm">
                            <MessageSquare size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400">Selecciona un chat</p>
                            <p className="text-xs text-gray-300">Responde las dudas de tus hosts en tiempo real</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
