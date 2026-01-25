"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, User, Loader2, ShieldCheck, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectUser: (user: any) => void;
}

export function NewChatModal({ isOpen, onClose, onSelectUser }: NewChatModalProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen && users.length === 0) {
            setLoading(true);
            fetch('/api/admin/users')
                .then(res => res.json())
                .then(json => {
                    if (json.success) setUsers(json.data);
                })
                .catch(err => console.error("Failed to load users", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] p-0 bg-white rounded-3xl overflow-hidden border-none shadow-2xl">
                <div className="p-6 pb-2 border-b border-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-gray-900">Nuevo Mensaje</DialogTitle>
                    </DialogHeader>
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="h-[400px] overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => onSelectUser(user)}
                                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all group text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-rose-100 group-hover:text-rose-500 transition-colors shrink-0">
                                        {user.role === 'admin' ? <ShieldCheck size={18} /> : <UserCircle size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-gray-900 truncate">{user.full_name || 'Sin Nombre'}</p>
                                            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                                    user.role === 'driver' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-gray-100 text-gray-500'
                                                }`}>
                                                {user.role === 'driver' ? 'Staff' : user.role === 'user' ? 'Host' : user.role}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </button>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    No se encontraron usuarios.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
