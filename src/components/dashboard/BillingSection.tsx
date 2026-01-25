"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { CreditCard, Plus, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { createSetupIntent, getHostPaymentMethods } from "@/app/actions/billing";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function AddCardForm({ onCardAdded }: { onCardAdded: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        try {
            // 1. Create Setup Intent
            const res = await createSetupIntent();
            if (!res.success || !res.data) throw new Error(res.error);

            // 2. Confirm Card Setup
            const result = await stripe.confirmCardSetup(res.data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                },
            });

            if (result.error) {
                toast({ title: "Error", description: result.error.message, variant: "destructive" });
            } else {
                toast({ title: "Éxito", description: "Tarjeta agregada correctamente." });
                onCardAdded();
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-4">
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: "#424770",
                                "::placeholder": { color: "#aab7c4" },
                            },
                            invalid: { color: "#9e2146" },
                        },
                    }}
                />
            </div>
            <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-[#FF5A5F] hover:bg-[#E03E43] text-white rounded-xl h-12 font-bold"
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}
                Registrar Tarjeta
            </Button>
            <p className="text-[10px] text-gray-400 text-center uppercase font-black tracking-widest">
                Seguridad Encriptada por Stripe
            </p>
        </form>
    );
}

export function BillingSection() {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    const refreshCards = async () => {
        setLoading(true);
        const res = await getHostPaymentMethods();
        if (res.success && res.data) setCards(res.data);
        setLoading(false);
        setShowAddForm(false);
    };

    useEffect(() => {
        refreshCards();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="text-[#FF5A5F]" /> Métodos de Pago
                </h2>
                {!showAddForm && (
                    <Button
                        variant="ghost"
                        className="text-[#FF5A5F] font-bold hover:bg-rose-50"
                        onClick={() => setShowAddForm(true)}
                    >
                        + Agregar Nueva
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-gray-300" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.map(card => (
                        <div key={card.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <CreditCard size={20} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 capitalize">
                                        {card.card.brand} •••• {card.card.last4}
                                    </p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                        Expira {card.card.exp_month}/{card.card.exp_year}
                                    </p>
                                </div>
                            </div>
                            <CheckCircle2 size={18} className="text-emerald-500" />
                        </div>
                    ))}

                    {cards.length === 0 && !showAddForm && (
                        <div className="md:col-span-2 py-12 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                            <p className="text-gray-400 font-medium">No hay tarjetas registradas.</p>
                        </div>
                    )}
                </div>
            )}

            {showAddForm && (
                <div className="max-w-md">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Nueva Tarjeta</p>
                        <button onClick={() => setShowAddForm(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Cancelar</button>
                    </div>
                    <Elements stripe={stripePromise}>
                        <AddCardForm onCardAdded={refreshCards} />
                    </Elements>
                </div>
            )}

            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl mt-8">
                <h4 className="text-xs font-black uppercase text-blue-600 tracking-widest mb-2">¿Cómo funciona el cobro?</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                    Cartagena Concierge realiza un **cobro automático** solo cuando el servicio es finalizado y verificado por el administrador. Recibirás un recibo detallado en tu correo electrónico cada vez que se complete una misión.
                </p>
            </div>
        </div>
    );
}
