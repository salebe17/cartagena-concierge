'use client';

import { Home, Calendar, NotebookPen, MessageSquare, LayoutGrid } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    onChange: (tab: any) => void;
    unreadMessages?: number;
}

export function BottomNav({ activeTab, onChange, unreadMessages = 0 }: BottomNavProps) {
    const navItems = [
        { id: 'hoy', label: 'Hoy', icon: Home },
        { id: 'calendario', label: 'Calendario', icon: Calendar },
        { id: 'anuncios', label: 'Anuncios', icon: NotebookPen },
        { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
        { id: 'servicios', label: 'Servicios', icon: LayoutGrid },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50 md:hidden pb-safe">
            <div className="flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`flex flex-col items-center gap-1 w-16 transition-colors ${isActive ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <div className="relative">
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {item.id === 'mensajes' && unreadMessages > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                        {unreadMessages}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
