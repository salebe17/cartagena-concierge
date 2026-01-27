'use client'

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
// Server Actions removed in favor of API Routes
import { Send, User, Loader2, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubble } from './ChatBubble';

interface ChatBoxProps {
    requestId?: string;
    userId?: string; // For general thread
    currentUserId: string;
    isAdmin?: boolean;
    className?: string; // Allow style overrides
    mobileLayout?: boolean;
}

export function ChatBox({ requestId, userId, currentUserId, isAdmin, className = '', mobileLayout = false }: ChatBoxProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Safety timeout to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        setMessages([]); // Clear previous state immediately to prevent leak/flash
        setLoading(true);

        const load = async (silent = false) => {
            if (!silent) setLoading(true);
            try {
                // Determine Query Params
                const params = new URLSearchParams();
                if (requestId) params.append('requestId', requestId);
                if (userId) params.append('userId', userId);

                // Fetch from API Route (Bypass Server Action)
                const res = await fetch(`/api/chat/conversation?${params.toString()}`);
                const json = await res.json();

                if (json.success && json.data) {
                    setMessages(prev => {
                        // Simple check to avoid re-rendering if identical? 
                        // JSON stringify comparison is heavy but safe for small chats.
                        // Or just update. React handles Diffing.
                        if (JSON.stringify(prev) !== JSON.stringify(json.data)) {
                            if (!silent) setTimeout(scrollToBottom, 100); // Scroll only on hard load? 
                            // If silent (poll), maybe don't force scroll unless we were at bottom?
                            // For now, let's just update state.
                            return json.data;
                        }
                        return prev;
                    });

                    // Mark unread as read if Admin
                    if (isAdmin) {
                        const unreadIds = json.data
                            .filter((m: any) => !m.is_read && m.sender_id !== currentUserId)
                            .map((m: any) => m.id);

                        if (unreadIds.length > 0) {
                            fetch('/api/chat/mark-read', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ids: unreadIds })
                            }).catch(err => console.error("Failed to mark as read:", err));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load conversation:", error);
            } finally {
                if (!silent) {
                    setLoading(false);
                    setMounted(true);
                    setTimeout(scrollToBottom, 500);
                }
            }
        };
        load();

        // Fallback Polling (Every 4 seconds)
        const interval = setInterval(() => load(true), 4000);


        // REALTIME SUBSCRIPTION
        // If we have a requestId, we trust the DB filter.
        // If we have a userId (Direct Chat), we must be careful not to listen to the world.
        const filter = requestId ? `service_request_id=eq.${requestId}` : undefined;

        const channel = supabase.channel(`chat_${requestId || userId || 'general'}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: filter // If undefined, listens to all messages (we must filter client-side)
            }, async (payload) => {
                const msg = payload.new;

                // STRICT CLIENT-SIDE FILTERING for Data Isolation
                // 1. If looking at a specific Request, ignore if msg doesn't match ID
                if (requestId && msg.service_request_id !== requestId) return;

                // 2. If Direct Message (no Request ID), check participants
                if (!requestId && userId) {
                    // Must be between ME and TARGET user
                    // (Sender is ME and Receiver is TARGET) OR (Sender is TARGET and Receiver is ME)
                    // Actually, just checking if TARGET is involved is usually enough for the Admin view of that user
                    const involved = (msg.sender_id === userId && msg.receiver_id === currentUserId) ||
                        (msg.receiver_id === userId && msg.sender_id === currentUserId) ||
                        (msg.sender_id === userId && msg.receiver_id === userId); // For self-messages in a DM context
                    if (!involved) return;

                    // Also exclude messages that belong to a specific Service Request?
                    // If I am in "Direct Chat", do I want to see "Service Request" updates?
                    // Maybe. But usually Direct Chat is for non-contextual or booking-agnostic chat.
                    // For now, let's allow it if the user is involved, to capture all history.
                }

                setMessages(prev => [...prev, msg]);
                setTimeout(scrollToBottom, 50);

                // Mark as read immediately if it's incoming and I'm watching
                if (isAdmin && msg.sender_id !== currentUserId) {
                    fetch('/api/chat/mark-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: [msg.id] })
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [requestId, isAdmin, currentUserId, userId]); // ADDED userId dependency

    const handleSend = async (e?: React.FormEvent, fileUrl?: string, fileType: 'text' | 'image' = 'text') => {
        if (e) e.preventDefault();
        const contentToSend = input.trim();

        if ((!contentToSend && !fileUrl) || sending) return;

        setSending(true);
        // If Admin, receiver is the owner of the thread
        const receiverId = isAdmin ? userId : undefined;

        // Optimistic update could go here, but let's wait for server for safety
        if (!navigator.onLine) {
            alert("No tienes conexión a internet. El mensaje no se pudo enviar.");
            setSending(false);
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const res = await fetch('/api/chat/send', {
                signal: controller.signal,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: contentToSend,
                    requestId,
                    receiverId,
                    mediaUrl: fileUrl,
                    mediaType: fileType
                })
            });

            clearTimeout(timeoutId);
            const json = await res.json();
            if (json.success) {
                setInput('');
            } else {
                console.error("Send failed:", json.error);
                alert("Error al enviar mensaje: " + json.error);
            }
        } catch (err: any) {
            console.error("Send error:", err);
            if (err.name === 'AbortError') {
                alert("El envío tardó demasiado. Por favor, verifica tu conexión.");
            } else {
                alert("Error de red. Intenta nuevamente.");
            }
        }

        setSending(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSending(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${currentUserId}/${fileName}`; // ISOLATION: User ID folder

            const { error: uploadError } = await supabase.storage
                .from('chat-media') // Ensure this bucket exists!
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-media')
                .getPublicUrl(filePath);

            await handleSend(undefined, publicUrl, 'image');

        } catch (error) {
            console.error('Upload failed:', error);
            // toast error?
        } finally {
            setSending(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-300" /></div>;

    return (
        <div className={`flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative ${className}`}>

            {/* Messages Area */}
            <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50`}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                <Send size={20} className="ml-1" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Comienza el chat</p>
                            <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Escribe un mensaje para contactar al soporte.</p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <ChatBubble
                        key={msg.id || idx}
                        message={msg}
                        isMe={msg.sender_id === currentUserId}
                    // senderName if group chat...
                    />
                ))}
            </div>

            {/* Input Area */}
            <form
                onSubmit={(e) => handleSend(e)}
                className={`p-3 md:p-4 bg-white border-t border-gray-100 flex gap-2 items-end shrink-0 transition-all w-full relative z-10`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                    className="p-3 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <Image size={20} />
                </button>

                <div className="flex-1 relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        placeholder="Escribe un mensaje..."
                        className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-gray-100 rounded-2xl px-4 py-3 text-sm font-medium resize-none max-h-32 min-h-[46px]"
                        rows={1}
                    />
                </div>

                <button
                    disabled={(!input.trim() && !sending)}
                    type="submit"
                    className={`p-3 rounded-xl flex items-center justify-center transition-all shadow-sm
                        ${input.trim()
                            ? 'bg-rose-500 text-white hover:bg-rose-600 transform hover:scale-105'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
}
