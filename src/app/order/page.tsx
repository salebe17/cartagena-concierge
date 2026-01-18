import { OrderForm } from "@/components/order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function OrderPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 dark:bg-black">
            <div className="max-w-md mx-auto">
                {/* Header Simple con Botón Atrás */}
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-emerald-400">New Cash Request</h1>
                </div>

                {/* Aquí renderizamos el componente que hizo el agente */}
                <OrderForm />
            </div>
        </div>
    );
}
