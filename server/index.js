/**
 * Backend Vote IAI - NotchPay (Option B: intégration directe)
 * API REST NotchPay via fetch (pas de SDK npm)
 * Hébergement: Railway
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const NOTCHPAY_API = 'https://api.notchpay.co';
const app = express();
app.use(cors({ origin: true })); // En prod, restreindre à votre domaine Vercel
app.use(express.json());

const NOTCHPAY_SECRET = process.env.NOTCHPAY_SECRET_KEY;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 3000;

if (!NOTCHPAY_SECRET) {
  console.warn('NOTCHPAY_SECRET_KEY manquant. Paiements désactivés.');
}

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

// Store en mémoire: reference -> { candidateId, packId, votes, status }
const pendingPayments = new Map();

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

  const votePacks = [
    { id: 'single', votes: 1, price: 100 },
    { id: 'pack5', votes: 5, price: 500 },
    { id: 'pack12', votes: 12, price: 1000 },
  ];
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
    status: 'pending',
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

  if (pending) {
    return res.json({
      reference,
      status: pending.status,
      candidateId: pending.candidateId,
      votes: pending.votes,
    });
  }

  if (!NOTCHPAY_SECRET) {
    return res.status(404).json({ reference, status: 'unknown' });
  }

  try {
    const payment = await notchpayRetrievePayment(reference);
    if (!payment) return res.status(404).json({ reference, status: 'unknown' });
    const status = payment?.transaction?.status || 'unknown';
    const meta = payment?.transaction?.customer_meta || payment?.customer_meta || {};
    const candidateId = meta.candidateId;
    const votes = meta.votes;

    if (status === 'complete' && candidateId && votes) {
      return res.json({
        reference,
        status: 'complete',
        candidateId,
        votes: Number(votes),
      });
    }
    return res.json({
      reference,
      status: status === 'failed' ? 'failed' : 'pending',
      candidateId: candidateId || null,
      votes: votes ? Number(votes) : null,
    });
  } catch (_) {
    return res.status(404).json({ reference, status: 'unknown' });
  }
});

// Webhook NotchPay (body JSON parsé par express.json())
app.post('/api/webhooks/notchpay', (req, res) => {
  const body = req.body || {};
  const event = body.event || body.type;
  const data = body.data || body.transaction || body;

  if (event === 'payment.complete' || event === 'charge.complete') {
    const ref = data?.reference || data?.reference_id;
    const meta = data?.customer_meta || data?.metadata || {};
    if (ref) {
      pendingPayments.set(ref, {
        candidateId: meta.candidateId,
        packId: meta.packId,
        votes: Number(meta.votes || 0),
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

// Health check pour Railway
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'vote-iai-api' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
