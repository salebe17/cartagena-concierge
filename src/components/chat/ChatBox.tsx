'use client'

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sendMessage, getConversation, markAsRead } from '@/app/actions/chat';
import { Send, User, Loader2, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatBoxProps {
    requestId?: string;
    userId?: string; // For general thread
    currentUserId: string;
    isAdmin?: boolean;
}

export function ChatBox({ requestId, userId, currentUserId, isAdmin }: ChatBoxProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const load = async () => {
            const data = await getConversation(requestId, userId);
            setMessages(data);
            setLoading(false);
            setTimeout(scrollToBottom, 100);

            // Mark unread as read if Admin
            if (isAdmin) {
                const unread = data.filter(m => !m.is_read && m.sender_id !== currentUserId).map(m => m.id);
                if (unread.length > 0) markAsRead(unread);
            }
        };
        load();

        // REALTIME SUBSCRIPTION
        const channel = supabase.channel(`chat_${requestId || 'general'}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: requestId ? `service_request_id=eq.${requestId}` : undefined
            }, async (payload) => {
                // Fetch full info for the new message (with profile)
                // Ideally this would be optimized, but for simplicity:
                setMessages(prev => [...prev, payload.new]);
                setTimeout(scrollToBottom, 50);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [requestId, isAdmin, currentUserId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        setSending(true);
        // If Admin, receiver is the owner of the thread
        const receiverId = isAdmin ? userId : undefined;
        const res = await sendMessage(input, requestId, receiverId);
        if (res.success) {
            setInput('');
        }
        setSending(false);
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-300" /></div>;

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <motion.div
                            key={msg.id || idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm 
                                    ${isMe
                                        ? 'bg-gray-900 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}
                                >
                                    {msg.content}
                                </div>
                                <div className="flex items-center gap-1 mt-1 px-1">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        msg.is_read
                                            ? <CheckCheck size={10} className="text-emerald-500" />
                                            : <Check size={10} className="text-gray-300" />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <User size={24} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">Inicia la conversación</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-gray-100 rounded-xl px-4 py-2 text-sm font-medium"
                />
                <button
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-black disabled:bg-gray-200 transition-colors shadow-sm"
                >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
}
