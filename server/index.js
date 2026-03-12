/**
 * Backend Vote IAI - NotchPay + PostgreSQL (Prisma)
 * Hébergement: Railway
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma, recordVote } from './db.js';

const NOTCHPAY_API = 'https://api.notchpay.co';
const app = express();

// CORS : autoriser le frontend (APP_URL) et l'admin (ADMIN_APP_URL).
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const ADMIN_APP_URL = process.env.ADMIN_APP_URL || '';
const allowedOrigins = [APP_URL, ADMIN_APP_URL].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(express.json());

const NOTCHPAY_SECRET = process.env.NOTCHPAY_SECRET_KEY;
// L'API Resources (pays, canaux) attend la clé PUBLIQUE dans Authorization (doc NotchPay)
const NOTCHPAY_PUBLIC = process.env.NOTCHPAY_PUBLIC_KEY || NOTCHPAY_SECRET;
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!NOTCHPAY_SECRET) console.warn('NOTCHPAY_SECRET_KEY manquant. Paiements NotchPay désactivés.');
if (!process.env.DATABASE_URL) console.warn('DATABASE_URL manquant. API candidats/stats désactivée.');

// ─────────────────────────────────────────────
// HELPERS NOTCHPAY
// ─────────────────────────────────────────────

// NotchPay attend la clé PUBLIQUE dans Authorization pour les paiements (création, récupération, process)
const NOTCHPAY_AUTH = NOTCHPAY_PUBLIC || NOTCHPAY_SECRET;

async function notchpayCreatePayment(body) {
  const res = await fetch(`${NOTCHPAY_API}/payments`, {
    method: 'POST',
    headers: {
      Authorization: NOTCHPAY_AUTH,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function notchpayRetrievePayment(reference) {
  const res = await fetch(`${NOTCHPAY_API}/payments/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: { Authorization: NOTCHPAY_AUTH },
  });
  if (!res.ok) return null;
  return res.json();
}

// Map en mémoire pour les paiements en attente (NotchPay)
const pendingPayments = new Map();

// Devise par pays (ISO 3166-1 alpha-2)
const COUNTRY_CURRENCY = {
  CM: 'XAF', CI: 'XOF', SN: 'XOF', KE: 'KES', UG: 'UGX', GH: 'GHS', NG: 'NGN',
  GA: 'XAF', TD: 'XAF', CG: 'XAF', CF: 'XAF', GQ: 'XAF',
};

function getPhoneCodeForCountry(countryCode) {
  const codes = { CM: '237', CI: '225', SN: '221', KE: '254', UG: '256', GH: '233', NG: '234', GA: '241', TD: '235', CG: '242', CF: '236', GQ: '240' };
  return codes[countryCode] || '237';
}

async function getVotePacks() {
  try {
    const packs = await prisma.votePack.findMany();
    return packs.map((p) => ({ id: p.id, votes: p.votes, price: p.price, popular: p.popular }));
  } catch (_) {
    return [
      { id: 'single', votes: 1, price: 100, popular: false },
      { id: 'pack5', votes: 5, price: 500, popular: true },
      { id: 'pack12', votes: 12, price: 1000, popular: false },
    ];
  }
}

// ─────────────────────────────────────────────
// RESSOURCES NOTCHPAY (pays et canaux)
// Doc : Authorization doit être la clé PUBLIQUE (GET /resources/countries, /resources/channels)
// Fallback statique si l'API ne répond pas ou renvoie vide
// ─────────────────────────────────────────────

const FALLBACK_COUNTRIES = [
  { code: 'CM', name: 'Cameroon', currency: 'XAF', flag: 'https://assets.notchpay.co/flags/cm.png', phone_code: '+237' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', flag: 'https://assets.notchpay.co/flags/ci.png', phone_code: '+225' },
  { code: 'SN', name: 'Senegal', currency: 'XOF', flag: 'https://assets.notchpay.co/flags/sn.png', phone_code: '+221' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: 'https://assets.notchpay.co/flags/gh.png', phone_code: '+233' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: 'https://assets.notchpay.co/flags/ng.png', phone_code: '+234' },
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: 'https://assets.notchpay.co/flags/ke.png', phone_code: '+254' },
  { code: 'UG', name: 'Uganda', currency: 'UGX', flag: 'https://assets.notchpay.co/flags/ug.png', phone_code: '+256' },
];

const FALLBACK_CHANNELS = {
  CM: [
    { id: 'cm.mtn', name: 'MTN Mobile Money', country: 'CM', currency: 'XAF', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/mtn.png', requires_phone: true },
    { id: 'cm.orange', name: 'Orange Money', country: 'CM', currency: 'XAF', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/orange.png', requires_phone: true },
    { id: 'cm.card', name: 'Carte Visa / Mastercard', country: 'CM', currency: 'XAF', type: 'card', logo: 'https://assets.notchpay.co/channels/card.png', requires_phone: false },
  ],
  CI: [
    { id: 'ci.mtn', name: 'MTN Mobile Money', country: 'CI', currency: 'XOF', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/mtn.png', requires_phone: true },
    { id: 'ci.orange', name: 'Orange Money', country: 'CI', currency: 'XOF', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/orange.png', requires_phone: true },
  ],
  SN: [
    { id: 'sn.wave', name: 'Wave', country: 'SN', currency: 'XOF', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/wave.png', requires_phone: true },
    { id: 'sn.orange', name: 'Orange Money', country: 'SN', currency: 'XOF', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/orange.png', requires_phone: true },
  ],
  GH: [
    { id: 'gh.mtn', name: 'MTN Mobile Money', country: 'GH', currency: 'GHS', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/mtn.png', requires_phone: true },
  ],
  NG: [
    { id: 'ng.mtn', name: 'MTN Mobile Money', country: 'NG', currency: 'NGN', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/mtn.png', requires_phone: true },
  ],
  KE: [
    { id: 'ke.mpesa', name: 'M-Pesa', country: 'KE', currency: 'KES', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/mpesa.png', requires_phone: true },
  ],
  UG: [
    { id: 'ug.airtel', name: 'Airtel Money', country: 'UG', currency: 'UGX', type: 'mobile_money', logo: 'https://assets.notchpay.co/channels/airtel.png', requires_phone: true },
  ],
};

app.get('/api/notchpay/countries', async (_req, res) => {
  if (!NOTCHPAY_PUBLIC && !NOTCHPAY_SECRET) {
    return res.json({ countries: FALLBACK_COUNTRIES });
  }
  try {
    const r = await fetch(`${NOTCHPAY_API}/countries`, {
      headers: { Authorization: NOTCHPAY_PUBLIC || NOTCHPAY_SECRET },
    });
    const data = await r.json().catch(() => ({}));
    const countries = data.items ?? data.countries ?? data.data ?? [];
    const list = Array.isArray(countries) ? countries : [];
    if (list.length === 0) {
      console.warn('[NotchPay] /countries vide ou erreur (status=%s). Utilisation du fallback.', r.status);
      return res.json({ countries: FALLBACK_COUNTRIES });
    }
    return res.json({ countries: list });
  } catch (e) {
    console.error('NotchPay countries error:', e);
    return res.json({ countries: FALLBACK_COUNTRIES });
  }
});

app.get('/api/notchpay/channels', async (req, res) => {
  const country = (req.query.country || 'CM').toString().toUpperCase();
  if (!NOTCHPAY_PUBLIC && !NOTCHPAY_SECRET) {
    // Utilise le fallback du pays, ou vide si pas de fallback (pas de CM par défaut)
    const fallback = FALLBACK_CHANNELS[country] || [];
    return res.json({ channels: fallback });
  }
  try {
    const r = await fetch(`${NOTCHPAY_API}/channels?country=${encodeURIComponent(country)}`, {
      headers: { Authorization: NOTCHPAY_PUBLIC || NOTCHPAY_SECRET },
    });
    const data = await r.json().catch(() => ({}));
    const channels = data.items ?? data.channels ?? data.data ?? [];
    const list = Array.isArray(channels) ? channels : [];
    if (list.length === 0) {
      // Pays non supporté par NotchPay → seulement fallback local si défini, sinon vide
      console.warn('[NotchPay] /channels?country=%s vide ou erreur (status=%s).', country, r.status);
      const fallback = FALLBACK_CHANNELS[country] || [];
      return res.json({ channels: fallback });
    }
    return res.json({ channels: list });
  } catch (e) {
    console.error('NotchPay channels error:', e);
    const fallback = FALLBACK_CHANNELS[country] || [];
    return res.json({ channels: fallback });
  }
});

// ─────────────────────────────────────────────
// ROUTES NOTCHPAY (paiement)
// ─────────────────────────────────────────────

// Créer un paiement puis lancer le canal (Mobile Money, etc.) — multi-pays
app.post('/api/votes/pay', async (req, res) => {
  if (!NOTCHPAY_AUTH) {
    return res.status(503).json({
      success: false,
      message: 'Paiement non configuré (clé API manquante).',
    });
  }

  const { candidateId, packId, amount, channel, phone, email, country: countryParam } = req.body;
  if (!candidateId || !packId || !amount || !channel) {
    return res.status(400).json({
      success: false,
      message: 'Paramètres manquants: candidateId, packId, amount, channel.',
    });
  }
  // Pour mobile_money / ussd le numéro est requis
  const phoneVal = phone ? String(phone).trim() : '';

  const country = (countryParam || 'CM').toString().toUpperCase().slice(0, 2);
  const currency = COUNTRY_CURRENCY[country] || 'XAF';

  const votePacks = await getVotePacks();
  const pack = votePacks.find((p) => p.id === packId);
  if (!pack || Number(amount) !== pack.price) {
    return res.status(400).json({
      success: false,
      message: 'Pack ou montant invalide.',
    });
  }

  const reference = `vote_${candidateId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // Détermine si le canal est une carte bancaire (Visa/Mastercard)
  const isCardChannel = /\.card$/i.test(channel) || channel.toLowerCase().includes('card');

  let paymentRef = reference;
  let payment = null;
  try {
    // Pour carte : pas de locked_channel → NotchPay gère la page Collect automatiquement
    const paymentBody = {
      amount: Number(amount),
      currency,
      customer: {
        email: email || 'vote@iai.cm',
        name: 'Votant IAI',
      },
      reference,
      callback: `${APP_URL}/vote/callback?ref=${reference}`,
      description: `Vote IAI - ${pack.votes} vote(s)`,
      customer_meta: { candidateId, packId, votes: pack.votes },
    };
    // N'ajouter locked_channel/locked_country que pour les paiements Mobile Money
    if (!isCardChannel) {
      paymentBody.locked_channel = channel;
      paymentBody.locked_country = country;
    }
    payment = await notchpayCreatePayment(paymentBody);
    if (payment?.transaction?.reference) paymentRef = payment.transaction.reference;
    else if (payment?.reference) paymentRef = payment.reference;
    if (payment?.code && payment.code >= 400) {
      return res.status(500).json({
        success: false,
        message: payment.message || 'Erreur lors de la création du paiement.',
      });
    }
  } catch (err) {
    console.error('NotchPay create error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Erreur lors de la création du paiement.',
    });
  }

  pendingPayments.set(reference, {
    candidateId,
    packId,
    votes: pack.votes,
    amount: pack.price,
    status: 'pending',
    provider: 'notchpay',
    notchpayRef: paymentRef !== reference ? paymentRef : null,
  });

  // Paiement CARTE (Visa/Mastercard) : redirection vers la page NotchPay (Collect)
  const authorizationUrl = payment?.authorization_url ?? payment?.transaction?.authorization_url ?? payment?.data?.authorization_url;
  if (isCardChannel && authorizationUrl) {
    try {
      await prisma.payment.upsert({
        where: { reference },
        create: {
          reference,
          status: 'pending',
          candidateId,
          packId,
          amount: pack.price,
          votesCount: pack.votes,
          provider: 'notchpay',
          notchpayRef: paymentRef !== reference ? paymentRef : null,
        },
        update: {
          status: 'pending',
          notchpayRef: paymentRef !== reference ? paymentRef : null,
        },
      });
    } catch (dbErr) {
      console.error('Payment DB create/update (card):', dbErr);
    }
    return res.json({
      success: true,
      reference,
      authorization_url: authorizationUrl,
      message: 'Redirection vers la page de paiement sécurisée (carte bancaire).',
    });
  }

  try {
    await prisma.payment.upsert({
      where: { reference },
      create: {
        reference,
        status: 'pending',
        candidateId,
        packId,
        amount: pack.price,
        votesCount: pack.votes,
        provider: 'notchpay',
        notchpayRef: paymentRef !== reference ? paymentRef : null,
      },
      update: {
        status: 'pending',
        candidateId,
        packId,
        amount: pack.price,
        votesCount: pack.votes,
        provider: 'notchpay',
        notchpayRef: paymentRef !== reference ? paymentRef : null,
      },
    });
  } catch (dbErr) {
    console.error('Payment DB create/update:', dbErr);
  }

  try {
    const phoneNum = phoneVal.replace(/\D/g, '');
    const phoneWithCode = phoneNum.length > 0 && phoneNum.length <= 10
      ? `${getPhoneCodeForCountry(country)}${phoneNum}`
      : phoneNum.length > 10 ? phoneNum : null;

    const processPayload = { channel, data: { country } };
    if (phoneWithCode) processPayload.data.phone = phoneWithCode;

    const processUrl = `${NOTCHPAY_API}/payments/${paymentRef}`;
    const processRes = await fetch(processUrl, {
      method: 'PUT',
      headers: {
        Authorization: NOTCHPAY_AUTH,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processPayload),
    });

    const processData = await processRes.json().catch(() => ({}));
    if (processRes.status !== 202 && processRes.status !== 200) {
      pendingPayments.delete(reference);
      try {
        await prisma.payment.updateMany({ where: { reference }, data: { status: 'failed' } });
      } catch (e) {}
      return res.status(400).json({
        success: false,
        message: processData.message || 'Échec du lancement du paiement Mobile Money.',
      });
    }
  } catch (err) {
    console.error('NotchPay process error:', err);
    pendingPayments.delete(reference);
    try {
      await prisma.payment.updateMany({ where: { reference }, data: { status: 'failed' } });
    } catch (e) {}
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du déclenchement du paiement sur votre téléphone.',
    });
  }

  return res.json({
    success: true,
    reference,
    message: 'Paiement initié. Confirmez sur votre téléphone (MTN/Orange).',
  });
});

/**
 * GET /api/payments/:reference/status
 * Polling du statut — NotchPay uniquement.
 */
app.get('/api/payments/:reference/status', async (req, res) => {
  const { reference } = req.params;
  const pending = pendingPayments.get(reference);

  // ── NotchPay ──
  if (NOTCHPAY_SECRET) {
    // Si le serveur a redémarré, pending peut être null → on recharge depuis la DB
    let dbPayment = null;
    if (!pending) {
      try {
        dbPayment = await prisma.payment.findUnique({ where: { reference } });
        if (dbPayment) {
          // Remettre en mémoire pour les prochains polls
          pendingPayments.set(reference, {
            candidateId: dbPayment.candidateId,
            packId: dbPayment.packId,
            votes: dbPayment.votesCount,
            amount: dbPayment.amount,
            status: dbPayment.status,
            provider: dbPayment.provider,
            notchpayRef: dbPayment.notchpayRef,
          });
        }
      } catch (e) {
        console.error('DB lookup error:', e);
      }
    }

    const resolved = pending ?? (dbPayment ? pendingPayments.get(reference) : null);

    // Si déjà complete en DB, répondre directement sans repoller NotchPay
    if (resolved?.status === 'complete') {
      return res.json({ reference, status: 'complete', candidateId: resolved.candidateId, votes: resolved.votes });
    }

    // Utiliser la référence NotchPay réelle (pas la référence locale)
    const notchpayRef = resolved?.notchpayRef || reference;
    try {
      const payment = await notchpayRetrievePayment(notchpayRef);
      if (payment) {
        const rawStatus = payment?.transaction?.status ?? payment?.payment?.status ?? payment?.status ?? 'unknown';
        const status = rawStatus.toLowerCase();
        console.log(`[NotchPay status] ref=${notchpayRef} status=${status}`);

        const meta = payment?.transaction?.customer_meta ?? payment?.customer_meta ?? payment?.metadata ?? {};
        const candidateId = meta.candidateId ?? resolved?.candidateId;
        const votes = meta.votes ?? resolved?.votes;

        if (status === 'complete' && candidateId && votes != null) {
          const votesCount = Number(votes);
          const amount = resolved?.amount ?? 0;
          try {
            await recordVote(candidateId, reference, votesCount, amount);
          } catch (e) {
            console.error('recordVote error:', e);
          }
          pendingPayments.set(reference, { candidateId, packId: meta.packId ?? resolved?.packId, votes: votesCount, status: 'complete' });
          try {
            await prisma.payment.updateMany({ where: { reference }, data: { status: 'complete' } });
          } catch (e) {}
          return res.json({ reference, status: 'complete', candidateId, votes: votesCount });
        }

        const failedStatuses = ['failed', 'cancelled', 'canceled', 'timeout', 'expired', 'rejected', 'insufficient_funds', 'declined', 'abandoned', 'refunded', 'partialy-refunded'];
        if (failedStatuses.includes(status)) {
          pendingPayments.set(reference, { ...resolved, status: 'failed' });
          try {
            await prisma.payment.updateMany({ where: { reference }, data: { status: 'failed' } });
          } catch (e) {}
          return res.json({ reference, status: 'failed', candidateId: resolved?.candidateId ?? null, votes: resolved?.votes ?? null });
        }
      } else {
        console.warn(`[NotchPay] Aucune réponse pour ref=${notchpayRef}`);
      }
    } catch (e) {
      console.error('[NotchPay status check error]', e);
    }
  }

  if (pending) {
    return res.json({ reference, status: pending.status, candidateId: pending.candidateId, votes: pending.votes });
  }
  return res.status(404).json({ reference, status: 'unknown' });
});

// ─────────────────────────────────────────────
// WEBHOOK NOTCHPAY
// ─────────────────────────────────────────────

app.post('/api/webhooks/notchpay', async (req, res) => {
  const body = req.body || {};
  const event = body.event || body.type;
  const data = body.data || body.transaction || body;
  console.log('[NotchPay webhook]', event, JSON.stringify(data).slice(0, 300));

  if (event === 'payment.complete' || event === 'charge.complete') {
    // NotchPay envoie sa propre référence (notchpayRef), pas la référence locale
    const notchpayRef = data?.reference || data?.reference_id;
    const meta = data?.customer_meta || data?.metadata || {};

    // Trouver le Payment en DB par notchpayRef OU par référence locale si c'est la même
    let dbPayment = null;
    try {
      dbPayment = await prisma.payment.findFirst({
        where: { OR: [{ notchpayRef }, { reference: notchpayRef }] },
      });
    } catch (e) {}

    const localRef = dbPayment?.reference ?? notchpayRef;
    const candidateId = meta.candidateId ?? dbPayment?.candidateId;
    const votesCount = Number(meta.votes ?? dbPayment?.votesCount ?? 0);
    const amount = Number(meta.amount ?? data?.amount ?? dbPayment?.amount ?? 0);

    console.log(`[NotchPay webhook] complete: localRef=${localRef} notchpayRef=${notchpayRef} candidateId=${candidateId} votes=${votesCount}`);

    if (localRef && candidateId && votesCount > 0) {
      try {
        await recordVote(candidateId, localRef, votesCount, amount);
      } catch (e) {
        console.error('recordVote webhook error:', e);
      }
      pendingPayments.set(localRef, { candidateId, packId: meta.packId ?? dbPayment?.packId, votes: votesCount, status: 'complete' });
      try {
        await prisma.payment.updateMany({
          where: { OR: [{ reference: localRef }, { notchpayRef }] },
          data: { status: 'complete' },
        });
      } catch (e) { console.error('DB update webhook error:', e); }
    }
  }

  if (event === 'payment.failed' || event === 'charge.failed') {
    const notchpayRef = data?.reference || data?.reference_id;
    try {
      await prisma.payment.updateMany({
        where: { OR: [{ reference: notchpayRef }, { notchpayRef }] },
        data: { status: 'failed' },
      });
    } catch (e) {}
    // Mettre à jour la Map si on a la référence locale
    if (notchpayRef && pendingPayments.has(notchpayRef)) {
      const p = pendingPayments.get(notchpayRef);
      p.status = 'failed';
      pendingPayments.set(notchpayRef, p);
    }
  }

  res.status(200).send('OK');
});

// ─────────────────────────────────────────────
// API DONNÉES (PostgreSQL) — inchangées
// ─────────────────────────────────────────────

const POPULAR_TOP_N = 3;
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: { votes: true },
      orderBy: { name: 'asc' },
    });
    const withVotes = candidates.map((c) => {
      const votes = c.votes.reduce((s, v) => s + v.votesCount, 0);
      const { votes: _, ...rest } = c;
      return { ...rest, votes };
    });
    const missTop = withVotes.filter((c) => c.category === 'miss').sort((a, b) => b.votes - a.votes).slice(0, POPULAR_TOP_N).map((c) => c.id);
    const masterTop = withVotes.filter((c) => c.category === 'master').sort((a, b) => b.votes - a.votes).slice(0, POPULAR_TOP_N).map((c) => c.id);
    const popularIds = new Set([...missTop, ...masterTop]);
    const list = withVotes.map((c) => {
      const badges = Array.isArray(c.badges) ? [...c.badges] : [];
      if (popularIds.has(c.id) && !badges.includes('popular')) badges.push('popular');
      const videoUrls = Array.isArray(c.videoUrls) && c.videoUrls.length > 0 ? c.videoUrls : (c.videoUrl ? [c.videoUrl] : []);
      return { ...c, badges, videoUrls };
    });
    res.json(list);
  } catch (e) {
    console.error('GET /api/candidates', e);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

app.get('/api/candidates/:id', async (req, res) => {
  try {
    const c = await prisma.candidate.findUnique({
      where: { id: req.params.id },
      include: { votes: true },
    });
    if (!c) return res.status(404).json({ error: 'Candidat non trouvé' });
    const votes = c.votes.reduce((s, v) => s + v.votesCount, 0);
    const { votes: vList, ...rest } = c;
    const videoUrls = Array.isArray(c.videoUrls) && c.videoUrls.length > 0 ? c.videoUrls : (c.videoUrl ? [c.videoUrl] : []);
    res.json({ ...rest, votes, videoUrls });
  } catch (e) {
    console.error('GET /api/candidates/:id', e);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

app.get('/api/vote-packs', async (req, res) => {
  try {
    const packs = await prisma.votePack.findMany({ orderBy: { price: 'asc' } });
    res.json(packs.map((p) => ({ id: p.id, votes: p.votes, price: p.price, popular: p.popular })));
  } catch (e) {
    console.error('GET /api/vote-packs', e);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({ include: { votes: true } });
    const withVotes = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      totalVotes: c.votes.reduce((s, v) => s + v.votesCount, 0),
    }));
    const totalVotes = withVotes.reduce((s, c) => s + c.totalVotes, 0);
    const missVotes = withVotes.filter((c) => c.category === 'miss').reduce((s, c) => s + c.totalVotes, 0);
    const masterVotes = withVotes.filter((c) => c.category === 'master').reduce((s, c) => s + c.totalVotes, 0);
    const missRanking = withVotes.filter((c) => c.category === 'miss').sort((a, b) => b.totalVotes - a.totalVotes).slice(0, 10);
    const masterRanking = withVotes.filter((c) => c.category === 'master').sort((a, b) => b.totalVotes - a.totalVotes).slice(0, 10);
    res.json({ totalVotes, missVotes, masterVotes, missRanking, masterRanking });
  } catch (e) {
    console.error('GET /api/stats', e);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────

function adminAuth(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}

app.get('/api/admin/candidates', adminAuth, async (req, res) => {
  try {
    const list = await prisma.candidate.findMany({ orderBy: { name: 'asc' } });
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/candidates', adminAuth, async (req, res) => {
  try {
    const { name, category, photo, biography, badges, gallery, videoUrl, videoUrls } = req.body;
    if (!name || !category || !photo || !biography) {
      return res.status(400).json({ error: 'name, category, photo, biography requis' });
    }
    const urls = Array.isArray(videoUrls) && videoUrls.length > 0 ? videoUrls : (videoUrl ? [videoUrl] : []);
    const c = await prisma.candidate.create({
      data: {
        name, category, photo, biography,
        badges: Array.isArray(badges) ? badges : [],
        gallery: Array.isArray(gallery) ? gallery : [],
        videoUrl: urls.length > 0 ? urls[0] : null,
        videoUrls: urls,
      },
    });
    res.status(201).json(c);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/candidates/:id', adminAuth, async (req, res) => {
  try {
    const { name, category, photo, biography, badges, gallery, videoUrl, videoUrls } = req.body;
    const data = {
      ...(name != null && { name }),
      ...(category != null && { category }),
      ...(photo != null && { photo }),
      ...(biography != null && { biography }),
      ...(badges != null && { badges: Array.isArray(badges) ? badges : [] }),
      ...(gallery != null && { gallery: Array.isArray(gallery) ? gallery : [] }),
    };
    if (videoUrls != null && Array.isArray(videoUrls)) {
      data.videoUrls = videoUrls;
      data.videoUrl = videoUrls.length > 0 ? videoUrls[0] : null;
    } else if (videoUrl != null) {
      data.videoUrl = videoUrl;
      data.videoUrls = videoUrl ? [videoUrl] : [];
    }
    const c = await prisma.candidate.update({ where: { id: req.params.id }, data });
    res.json(c);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Candidat non trouvé' });
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/admin/candidates/:id', adminAuth, async (req, res) => {
  try {
    await prisma.candidate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Candidat non trouvé' });
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/vote-packs', adminAuth, async (req, res) => {
  try {
    const list = await prisma.votePack.findMany({ orderBy: { id: 'asc' } });
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/vote-packs', adminAuth, async (req, res) => {
  try {
    const { id, votes, price, popular } = req.body;
    if (!id || votes == null || price == null) {
      return res.status(400).json({ error: 'id, votes, price requis' });
    }
    const p = await prisma.votePack.create({
      data: { id, votes: Number(votes), price: Number(price), popular: Boolean(popular) },
    });
    res.status(201).json(p);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Un pack avec cet id existe déjà' });
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/admin/vote-packs/:id', adminAuth, async (req, res) => {
  try {
    const { votes, price, popular } = req.body;
    const p = await prisma.votePack.update({
      where: { id: req.params.id },
      data: {
        ...(votes != null && { votes: Number(votes) }),
        ...(price != null && { price: Number(price) }),
        ...(popular != null && { popular: Boolean(popular) }),
      },
    });
    res.json(p);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Pack non trouvé' });
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/admin/vote-packs/:id', adminAuth, async (req, res) => {
  try {
    await prisma.votePack.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Pack non trouvé' });
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/payments', adminAuth, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const status = req.query.status;
    const where = status ? { status } : {};
    const [list, total] = await Promise.all([
      prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
      prisma.payment.count({ where }),
    ]);
    res.json({ items: list, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/votes', adminAuth, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const candidateId = req.query.candidateId;
    const where = candidateId ? { candidateId } : {};
    const [list, total] = await Promise.all([
      prisma.vote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: { candidate: { select: { name: true, category: true } } },
      }),
      prisma.vote.count({ where }),
    ]);
    res.json({ items: list, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Health check pour Railway
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'vote-iai-api' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
