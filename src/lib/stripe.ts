import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    // We don't throw here to avoid build evaluation issues if env is missing during CI
    // but the actions will check it.
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia' as any, // Most recent or stable
    appInfo: {
        name: 'Cartagena Concierge',
        version: '0.1.0',
    },
});
