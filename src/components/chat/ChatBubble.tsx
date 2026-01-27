"use client";

import { motion } from "framer-motion";
import { Check, CheckCheck, User } from "lucide-react";

import { Message } from "@/lib/types";

interface ChatBubbleProps {
    message: Message;
    isMe: boolean;
    senderName?: string;
    avatarUrl?: string; // Optional avatar
}

export function ChatBubble({ message, isMe, senderName }: ChatBubbleProps) {
    // Format time: 10:45 AM
    const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
        >
            {/* Avatar for "Them" */}
            {!isMe && (
                <div className="flex-shrink-0 mr-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                        <User size={14} />
                    </div>
                </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender Name (Optional, good for group chats or clarify) */}
                {!isMe && senderName && (
                    <span className="text-[10px] text-gray-400 ml-1 mb-1">{senderName}</span>
                )}

                {/* Bubble */}
                <div
                    className={`relative px-4 py-3 shadow-sm transition-all
                    ${isMe
                            ? 'bg-rose-500 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                        }
                    `}
                >
                    {/* Media Render: IMAGE */}
                    {message.media_url && message.media_type === 'image' && (
                        <div className="mb-2 rounded-lg overflow-hidden max-w-full">
                            <img
                                src={message.media_url}
                                alt="Shared image"
                                className="object-cover max-h-60 w-full hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => window.open(message.media_url, '_blank')}
                            />
                        </div>
                    )}

                    {/* Media Render: VIDEO */}
                    {message.media_url && message.media_type === 'video' && (
                        <div className="mb-2 rounded-lg overflow-hidden max-w-full">
                            <video
                                src={message.media_url}
                                controls
                                className="max-h-60 w-full bg-black"
                            />
                        </div>
                    )}

                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isMe ? 'text-white' : 'text-gray-700'}`}>
                        {message.content}
                    </p>

                    {/* Metadata (Time + ticks) */}
                    <div className={`flex items-center justify-end gap-1 mt-1 select-none opacity-80
                        ${isMe ? 'text-rose-100' : 'text-gray-400'}`}
                    >
                        <span className="text-[10px] font-medium tracking-tighter">{time}</span>
                        {isMe && (
                            <span>
                                {message.is_read ? (
                                    <CheckCheck size={12} className="text-white" />
                                ) : (
                                    <Check size={12} className="text-rose-200" />
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
