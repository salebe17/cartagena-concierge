import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    // We don't throw here to avoid build evaluation issues if env is missing during CI
    // but the actions will check it.
}

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
    if (!stripeInstance) {
        // Reverting to Env Var to pass GitHub Security Scan
        const secretKey = process.env.STRIPE_SECRET_KEY;

        if (!secretKey) {
            console.error("FATAL: STRIPE_SECRET_KEY is undefined. Check Vercel Env Vars.");
        }

        stripeInstance = new Stripe(secretKey || 'MISSING_KEY', {
            apiVersion: '2025-01-27.acacia' as any,
            appInfo: {
                name: 'Cartagena Concierge',
                version: '0.1.0',
            },
            typescript: true,
        });
    }
    return stripeInstance;
};
