/**
 * stripe.js — Gestion des paiements Stripe (cartes internationales)
 * Utilisé par index.js pour les routes /api/votes/pay-stripe et /api/webhooks/stripe
 */
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Instance Stripe (null si clé manquante)
export const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
export { STRIPE_WEBHOOK_SECRET };

if (!STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY manquant. Paiements Stripe désactivés.');
}

/**
 * Crée un PaymentIntent Stripe.
 * @param {number} amountXAF  - Montant en FCFA (XAF)
 * @param {string} currency   - Devise ('xaf' ou 'eur', 'usd', etc.)
 * @param {object} metadata   - Données à attacher (candidateId, packId, votes, reference)
 * @returns {Promise<Stripe.PaymentIntent>}
 */
export async function createStripePaymentIntent(amountXAF, currency = 'xaf', metadata = {}) {
  if (!stripe) throw new Error('Stripe non configuré (STRIPE_SECRET_KEY manquant).');

  // Stripe travaille en centimes pour les devises décimales, mais XAF est une devise "zero-decimal"
  // donc on passe le montant tel quel en XAF. Pour EUR/USD, il faudrait multiplier par 100.
  const zeroDecimalCurrencies = ['bif', 'clp', 'gnf', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof'];
  const isZeroDecimal = zeroDecimalCurrencies.includes(currency.toLowerCase());
  const amount = isZeroDecimal ? Math.round(amountXAF) : Math.round(amountXAF * 100);

  return stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    metadata,
    // Permet de collecter carte + wallets (Apple Pay, Google Pay) automatiquement
    automatic_payment_methods: { enabled: true },
  });
}

/**
 * Récupère un PaymentIntent par son ID.
 * @param {string} paymentIntentId
 * @returns {Promise<Stripe.PaymentIntent|null>}
 */
export async function retrieveStripePaymentIntent(paymentIntentId) {
  if (!stripe) return null;
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (e) {
    console.error('Stripe retrieve error:', e.message);
    return null;
  }
}

/**
 * Construit et vérifie un événement Stripe depuis un webhook.
 * @param {Buffer} rawBody  - Corps brut de la requête (avant JSON.parse)
 * @param {string} signature - Header 'stripe-signature'
 * @returns {Stripe.Event}
 */
export function constructStripeWebhookEvent(rawBody, signature) {
  if (!stripe) throw new Error('Stripe non configuré.');
  if (!STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET manquant.');
  return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
}