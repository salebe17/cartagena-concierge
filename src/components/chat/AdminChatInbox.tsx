'use client'

import { useState, useEffect } from 'react';
import { getAdminInbox } from '@/app/actions/chat';
import { ChatBox } from './ChatBox';
import { MessageSquare, Clock, Home, Loader2, ArrowLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewChatModal } from './NewChatModal';

export function AdminChatInbox({ currentUserId }: { currentUserId: string }) {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);

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

    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = conversations
        .filter(c => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = c.senderName.toLowerCase().includes(term) || c.propertyTitle.toLowerCase().includes(term);
            const isNotMe = c.chatPartnerId !== currentUserId; // Don't show self-chats if any
            return matchesSearch && isNotMe;
        })
        .sort((a, b) => {
            // Priority 1: Unread
            if (a.unread && !b.unread) return -1;
            if (!a.unread && b.unread) return 1;
            // Priority 2: Timestamp (Newest first)
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

    const handleStartChat = (user: any) => {
        setIsNewChatOpen(false);
        // Check if conversation exists
        const existing = conversations.find(c => c.chatPartnerId === user.id);
        if (existing) {
            setSelectedConv(existing);
        } else {
            // Create temporary conversation object for UI
            const newConv = {
                id: null, // No request ID, generic chat
                chatPartnerId: user.id,
                isRequest: false,
                senderName: user.full_name,
                propertyTitle: 'Mensaje Directo', // Context
                timestamp: new Date().toISOString(),
                unread: false
            };
            // Optionally add to list immediately or just select it
            setSelectedConv(newConv);
        }
    };

    if (loading && conversations.length === 0) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gray-300" /></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 h-[600px]">
            {/* Sidebar: Conversations List */}
            <div className={`md:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
                {/* Header & Search */}
                <div className="p-4 border-b border-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Mensajes</h3>
                            <div className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500">
                                {conversations.length}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsNewChatOpen(true)}
                            className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-colors shadow-lg shadow-gray-200"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o propiedad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border-none text-xs font-medium rounded-xl py-2 pl-3 pr-8 focus:ring-1 focus:ring-gray-200 transaction-all placeholder:text-gray-400"
                        />
                        <MessageSquare size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.map(conv => (
                        <button
                            key={conv.id || conv.chatPartnerId}
                            onClick={() => setSelectedConv(conv)}
                            className={`w-full text-left p-4 border-b border-gray-50 transition-all hover:bg-gray-50 group relative
                                ${selectedConv?.chatPartnerId === conv.chatPartnerId ? 'bg-rose-50/50' : ''}`}
                        >
                            {/* Unread Indicator Status Bar */}
                            {conv.unread && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-r-full" />
                            )}

                            <div className="flex justify-between items-start mb-1.5 pl-2">
                                <p className={`text-sm tracking-tight truncate pr-2 ${conv.unread ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                    {conv.senderName}
                                </p>
                                <span className={`text-[9px] font-bold shrink-0 ${conv.unread ? 'text-rose-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                    {mounted ? new Date(conv.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--'}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 mb-2 pl-2">
                                <div className={`p-1 rounded-md ${conv.unread ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Home size={10} />
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate max-w-[180px]">{conv.propertyTitle}</p>
                            </div>

                            <p className={`pl-2 text-xs truncate leading-relaxed ${conv.unread ? 'font-bold text-gray-800' : 'text-gray-400'}`}>
                                {conv.lastMessage}
                            </p>
                        </button>
                    ))}

                    {filteredConversations.length === 0 && (
                        <div className="p-10 text-center flex flex-col items-center justify-center opacity-50 space-y-2">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                                <MessageSquare size={20} />
                            </div>
                            <span className="text-gray-400 text-xs font-medium">
                                {searchTerm ? 'No se encontraron resultados.' : 'No hay mensajes aún.'}
                            </span>
                        </div>
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
                            <button onClick={() => setIsNewChatOpen(true)} className="mt-4 text-xs font-bold text-blue-500 hover:underline">
                                Iniciar nueva conversación
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <NewChatModal
                isOpen={isNewChatOpen}
                onClose={() => setIsNewChatOpen(false)}
                onSelectUser={handleStartChat}
            />
        </div>
    );
}
