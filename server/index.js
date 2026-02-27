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
app.use(cors({ origin: true }));
app.use(express.json());

const NOTCHPAY_SECRET = process.env.NOTCHPAY_SECRET_KEY;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!NOTCHPAY_SECRET) console.warn('NOTCHPAY_SECRET_KEY manquant. Paiements désactivés.');
if (!process.env.DATABASE_URL) console.warn('DATABASE_URL manquant. API candidats/stats désactivée.');

async function notchpayCreatePayment(body) {
  const res = await fetch(`${NOTCHPAY_API}/payments`, {
    method: 'POST',
    headers: {
      Authorization: NOTCHPAY_SECRET,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function notchpayRetrievePayment(reference) {
  const res = await fetch(`${NOTCHPAY_API}/payments/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: { Authorization: NOTCHPAY_SECRET },
  });
  if (!res.ok) return null;
  return res.json();
}

const pendingPayments = new Map();

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

// Créer un paiement puis lancer le Mobile Money (Option B)
app.post('/api/votes/pay', async (req, res) => {
  if (!NOTCHPAY_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Paiement non configuré (clé API manquante).',
    });
  }

  const { candidateId, packId, amount, channel, phone, email } = req.body;
  if (!candidateId || !packId || !amount || !channel || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Paramètres manquants: candidateId, packId, amount, channel, phone.',
    });
  }

  const votePacks = await getVotePacks();
  const pack = votePacks.find((p) => p.id === packId);
  if (!pack || Number(amount) !== pack.price) {
    return res.status(400).json({
      success: false,
      message: 'Pack ou montant invalide.',
    });
  }

  const reference = `vote_${candidateId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  let paymentRef = reference;
  try {
    const payment = await notchpayCreatePayment({
      amount: Number(amount),
      currency: 'XAF',
      customer: {
        email: email || 'vote@iai.cm',
        name: 'Votant IAI',
      },
      reference,
      callback: `${APP_URL}/vote/callback?ref=${reference}`,
      description: `Vote IAI - ${pack.votes} vote(s)`,
      locked_channel: channel,
      locked_country: 'CM',
      customer_meta: { candidateId, packId, votes: pack.votes },
    });
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
    notchpayRef: paymentRef !== reference ? paymentRef : null,
  });

  try {
    const phoneNum = String(phone).replace(/\D/g, '');
    const processUrl = `https://api.notchpay.co/payments/${paymentRef}`;
    const processRes = await fetch(processUrl, {
      method: 'PUT',
      headers: {
        Authorization: NOTCHPAY_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        data: {
          phone: phoneNum.startsWith('237') ? phoneNum : `237${phoneNum}`,
          country: 'CM',
        },
      }),
    });

    const processData = await processRes.json().catch(() => ({}));
    if (processRes.status !== 202 && processRes.status !== 200) {
      pendingPayments.delete(reference);
      return res.status(400).json({
        success: false,
        message: processData.message || 'Échec du lancement du paiement Mobile Money.',
      });
    }
  } catch (err) {
    console.error('NotchPay process error:', err);
    pendingPayments.delete(reference);
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

// Statut d’un paiement (pour le polling frontend)
app.get('/api/payments/:reference/status', async (req, res) => {
  const { reference } = req.params;
  const pending = pendingPayments.get(reference);

  if (NOTCHPAY_SECRET) {
    const notchpayRef = pending?.notchpayRef || reference;
    try {
      const payment = await notchpayRetrievePayment(notchpayRef);
      if (payment) {
        const status = (payment?.transaction?.status ?? payment?.payment?.status ?? payment?.status ?? 'unknown').toLowerCase();
        const meta = payment?.transaction?.customer_meta ?? payment?.customer_meta ?? payment?.metadata ?? {};
        const candidateId = meta.candidateId ?? pending?.candidateId;
        const votes = meta.votes ?? pending?.votes;

        if (status === 'complete' && candidateId && votes != null) {
          const votesCount = Number(votes);
          const amount = pending?.amount ?? 0;
          try {
            await recordVote(candidateId, reference, votesCount, amount);
          } catch (e) {
            console.error('recordVote error:', e);
          }
          pendingPayments.set(reference, {
            candidateId,
            packId: meta.packId ?? pending?.packId,
            votes: votesCount,
            status: 'complete',
          });
          return res.json({
            reference,
            status: 'complete',
            candidateId,
            votes: votesCount,
          });
        }
        const failedStatuses = ['failed', 'cancelled', 'canceled', 'timeout', 'expired', 'rejected', 'insufficient_funds', 'declined', 'abandoned', 'refunded', 'partialy-refunded'];
        const isFailed = failedStatuses.includes(status);
        if (isFailed) {
          if (pending) {
            pending.status = 'failed';
            pendingPayments.set(reference, pending);
          }
          return res.json({
            reference,
            status: 'failed',
            candidateId: pending?.candidateId ?? null,
            votes: pending?.votes ?? null,
          });
        }
      }
    } catch (_) {}
  }

  if (pending) {
    return res.json({
      reference,
      status: pending.status,
      candidateId: pending.candidateId,
      votes: pending.votes,
    });
  }

  return res.status(404).json({ reference, status: 'unknown' });
});

// Webhook NotchPay (body JSON parsé par express.json())
app.post('/api/webhooks/notchpay', async (req, res) => {
  const body = req.body || {};
  const event = body.event || body.type;
  const data = body.data || body.transaction || body;

  if (event === 'payment.complete' || event === 'charge.complete') {
    const ref = data?.reference || data?.reference_id;
    const meta = data?.customer_meta || data?.metadata || {};
    const candidateId = meta.candidateId;
    const votesCount = Number(meta.votes || 0);
    const amount = Number(meta.amount || data?.amount || 0);
    if (ref && candidateId && votesCount > 0) {
      try {
        await recordVote(candidateId, ref, votesCount, amount);
      } catch (e) {
        console.error('recordVote webhook error:', e);
      }
      pendingPayments.set(ref, {
        candidateId,
        packId: meta.packId,
        votes: votesCount,
        status: 'complete',
      });
    }
  }
  if (event === 'payment.failed' || event === 'charge.failed') {
    const ref = data?.reference || data?.reference_id;
    if (ref && pendingPayments.has(ref)) {
      const p = pendingPayments.get(ref);
      p.status = 'failed';
      pendingPayments.set(ref, p);
    }
  }
  res.status(200).send('OK');
});

// --- API données (PostgreSQL) ---

// Liste des candidats avec total des votes
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: { votes: true },
      orderBy: { name: 'asc' },
    });
    const list = candidates.map((c) => {
      const votes = c.votes.reduce((s, v) => s + v.votesCount, 0);
      const { votes: _, ...rest } = c;
      return { ...rest, votes };
    });
    res.json(list);
  } catch (e) {
    console.error('GET /api/candidates', e);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// Détail d'un candidat avec total des votes
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const c = await prisma.candidate.findUnique({
      where: { id: req.params.id },
      include: { votes: true },
    });
    if (!c) return res.status(404).json({ error: 'Candidat non trouvé' });
    const votes = c.votes.reduce((s, v) => s + v.votesCount, 0);
    const { votes: vList, ...rest } = c;
    res.json({ ...rest, votes });
  } catch (e) {
    console.error('GET /api/candidates/:id', e);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// Packs de vote (pour la modal de paiement)
app.get('/api/vote-packs', async (req, res) => {
  try {
    const packs = await prisma.votePack.findMany({ orderBy: { price: 'asc' } });
    res.json(packs.map((p) => ({ id: p.id, votes: p.votes, price: p.price, popular: p.popular })));
  } catch (e) {
    console.error('GET /api/vote-packs', e);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// Stats agrégées pour le dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: { votes: true },
    });
    const withVotes = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      totalVotes: c.votes.reduce((s, v) => s + v.votesCount, 0),
    }));
    const totalVotes = withVotes.reduce((s, c) => s + c.totalVotes, 0);
    const missVotes = withVotes.filter((c) => c.category === 'miss').reduce((s, c) => s + c.totalVotes, 0);
    const masterVotes = withVotes.filter((c) => c.category === 'master').reduce((s, c) => s + c.totalVotes, 0);
    const missRanking = withVotes
      .filter((c) => c.category === 'miss')
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 10);
    const masterRanking = withVotes
      .filter((c) => c.category === 'master')
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 10);
    res.json({
      totalVotes,
      missVotes,
      masterVotes,
      missRanking,
      masterRanking,
    });
  } catch (e) {
    console.error('GET /api/stats', e);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// --- Admin (sans comptes utilisateurs : header x-admin-secret) ---
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
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/candidates', adminAuth, async (req, res) => {
  try {
    const { name, category, photo, biography, badges, gallery, videoUrl } = req.body;
    if (!name || !category || !photo || !biography) {
      return res.status(400).json({ error: 'name, category, photo, biography requis' });
    }
    const c = await prisma.candidate.create({
      data: {
        name,
        category,
        photo,
        biography,
        badges: Array.isArray(badges) ? badges : [],
        gallery: Array.isArray(gallery) ? gallery : [],
        videoUrl: videoUrl || null,
      },
    });
    res.status(201).json(c);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/admin/candidates/:id', adminAuth, async (req, res) => {
  try {
    const { name, category, photo, biography, badges, gallery, videoUrl } = req.body;
    const c = await prisma.candidate.update({
      where: { id: req.params.id },
      data: {
        ...(name != null && { name }),
        ...(category != null && { category }),
        ...(photo != null && { photo }),
        ...(biography != null && { biography }),
        ...(badges != null && { badges: Array.isArray(badges) ? badges : [] }),
        ...(gallery != null && { gallery: Array.isArray(gallery) ? gallery : [] }),
        ...(videoUrl != null && { videoUrl }),
      },
    });
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

// Health check pour Railway
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'vote-iai-api' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
