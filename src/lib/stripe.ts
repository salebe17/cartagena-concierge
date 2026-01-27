import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    // We don't throw here to avoid build evaluation issues if env is missing during CI
    // but the actions will check it.
}

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn("STRIPE_SECRET_KEY is missing. Stripe calls will fail.");
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'MISSING_KEY', {
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
