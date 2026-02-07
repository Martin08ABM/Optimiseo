import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

export const STRIPE_CONFIG = {
  currency: 'eur',
  plans: {
    pro: {
      priceId: process.env.STRIPE_PRO_PRICE_ID || '', // Añadirás esto después
      amount: 1200, // 12.00 EUR in cents
    },
  },
} as const;
