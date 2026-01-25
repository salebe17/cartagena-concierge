'use client'

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sendMessage, getConversation, markAsRead } from '@/app/actions/chat';
import { Send, User, Loader2, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubble } from './ChatBubble';

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
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getConversation(requestId || null, userId || null);
                if (data) {
                    setMessages(data);
                    // Mark unread as read if Admin
                    if (isAdmin) {
                        const unread = data.filter((m: any) => !m.is_read && m.sender_id !== currentUserId).map((m: any) => m.id);
                        if (unread.length > 0) markAsRead(unread);
                    }
                }
            } catch (error) {
                console.error("Failed to load conversation:", error);
            } finally {
                setLoading(false);
                setMounted(true);
                setTimeout(scrollToBottom, 500);
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
                setMessages(prev => [...prev, payload.new]);
                setTimeout(scrollToBottom, 50);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [requestId, isAdmin, currentUserId]);

    const handleSend = async (e?: React.FormEvent, fileUrl?: string, fileType: 'text' | 'image' = 'text') => {
        if (e) e.preventDefault();
        const contentToSend = input.trim();

        if ((!contentToSend && !fileUrl) || sending) return;

        setSending(true);
        // If Admin, receiver is the owner of the thread
        const receiverId = isAdmin ? userId : undefined;

        // Optimistic update could go here, but let's wait for server for safety
        const res = await sendMessage(contentToSend, requestId, receiverId, fileUrl, fileType);

        if (res.success) {
            setInput('');
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
            const filePath = `chat/${fileName}`;

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
        <div className="flex flex-col h-full md:h-[500px] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative">

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
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
            <form onSubmit={(e) => handleSend(e)} className="p-3 md:p-4 bg-white border-t border-gray-100 flex gap-2 items-end z-10 relative">
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
