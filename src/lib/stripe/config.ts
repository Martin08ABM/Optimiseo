import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY || 'dummy_stripe_secret_key_for_build';

export const stripe = new Stripe(apiKey, {
  apiVersion: '2026-01-28.clover',
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
