import { ClientNav } from "@/components/client-nav";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen bg-[var(--color-bg-dark)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-black to-black text-white">
            {/* Background Decorators */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none z-0" />
            <div className="hidden sm:block absolute top-1/4 -right-64 w-[500px] h-[500px] bg-[var(--color-primary)]/5 blur-[120px] rounded-full pointer-events-none z-0" />

            {/* Persistent Navigation */}
            <ClientNav />

            {/* Main Content Area: Offset for side navigation on desktop and bottom navigation on mobile */}
            <main className="relative z-10 w-full sm:pl-64 pb-24 sm:pb-0">
                <div className="mx-auto max-w-7xl max-sm:px-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
