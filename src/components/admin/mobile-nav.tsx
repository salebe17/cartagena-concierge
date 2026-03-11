"use client";

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, ShieldAlert, Menu } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Moderation Hub', href: '/admin/users', icon: Users },
    { name: 'Treasury & Escrow', href: '/admin/finance', icon: CreditCard },
    { name: 'Disputes', href: '/admin/disputes', icon: ShieldAlert },
];

export function AdminMobileNav() {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();

    // Close sheet on navigation
    React.useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-gray-300 hover:text-white">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-gray-900 border-r border-gray-800 p-0">
                <SheetHeader className="h-16 flex items-start justify-center px-6 border-b border-gray-800">
                    <SheetTitle className="text-left text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-emerald-500 bg-clip-text text-transparent pt-2">
                        FairBid Command
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-gray-800 text-white shadow-[var(--shadow-neon)]'
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-100'
                                    }`}
                            >
                                <Icon
                                    className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-500 group-hover:text-[var(--color-primary)]'
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </SheetContent>
        </Sheet>
    );
}
