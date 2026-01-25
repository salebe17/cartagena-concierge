'use client';

import { MessageSquare } from "lucide-react";
import { ChatBox } from "../chat/ChatBox";

interface HostMessagesViewProps {
    bookings: any[];
    currentUserId: string;
    userName: string;
}

export function HostMessagesView({ bookings, currentUserId, userName }: HostMessagesViewProps) {
    return (
        <div className="fixed inset-0 z-40 pb-[100px] flex flex-col bg-gray-50 md:static md:h-[calc(100vh-140px)] md:bg-transparent md:pb-0 md:z-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0 px-4 md:px-0 mt-4 md:mt-0">
                <h1 className="text-3xl font-black text-[#222222] tracking-tight">Soporte</h1>
            </div>

            {/* Chat Interface - Direct to Support for now */}
            <div className="flex-1 bg-white rounded-t-[2rem] rounded-b-none md:rounded-3xl border-x-0 border-b-0 border-t md:border border-gray-100 overflow-hidden shadow-none md:shadow-sm flex flex-col">
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-md">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-tight">Soporte Concierge</h3>
                        <p className="text-xs text-gray-500">Siempre disponibles para ti</p>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <ChatBox
                        currentUserId={currentUserId}
                        userId={currentUserId}
                        isAdmin={false}
                        className="h-full border-none shadow-none rounded-none"
                    />
                </div>
            </div>
        </div>
    );
}
