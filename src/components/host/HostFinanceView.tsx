"use client";

import { useState } from "react";
import { UserFinanceSection } from "../dashboard/UserFinanceSection";
import { BillingSection } from "../dashboard/BillingSection";
import { Wallet, CreditCard } from "lucide-react";

export function HostFinanceView() {
    const [activeTab, setActiveTab] = useState<'transactions' | 'methods'>('transactions');

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-black text-[#222222]">Billetera</h1>
            </div>

            {/* Segmented Control */}
            <div className="bg-gray-100 p-1 rounded-2xl flex mb-8">
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'transactions' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Wallet size={16} /> Movimientos
                </button>
                <button
                    onClick={() => setActiveTab('methods')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'methods' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <CreditCard size={16} /> Tarjetas
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'transactions' ? (
                    <UserFinanceSection />
                ) : (
                    <BillingSection />
                )}
            </div>
        </div>
    );
}
