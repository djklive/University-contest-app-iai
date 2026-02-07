# 📱 Guide d'Implémentation NotchPay - Application Vote IAI

Documentation complète pour intégrer les paiements Mobile Money (MTN, Orange) via NotchPay dans l'application de vote en ligne IAI-Cameroun.

---

## 📋 Table des matières

1. [Présentation de NotchPay](#1-présentation-de-notchpay)
2. [Prérequis et Configuration](#2-prérequis-et-configuration)
3. [Architecture d'intégration](#3-architecture-dintégration)
4. [Implémentation Frontend](#4-implémentation-frontend)
5. [Backend / API](#5-backend--api)
6. [Channels Mobile Money Cameroun](#6-channels-mobile-money-cameroun)
7. [Tests](#7-tests)
8. [Webhooks](#8-webhooks)
9. [Gestion des erreurs](#9-gestion-des-erreurs)
10. [Passage en production](#10-passage-en-production)

---

## 1. Présentation de NotchPay

**NotchPay** est une plateforme de paiement africaine permettant d'accepter:
- **Mobile Money** (MTN, Orange Money, etc.)
- Cartes bancaires
- Autres moyens locaux

**Pour le Cameroun:**
- Devise: **XAF** (Franc CFA)
- Opérateurs: MTN Mobile Money (`cm.mtn`), Orange Money (`cm.orange`), EU Mobile, Yoomee
- Format téléphone: `+237XXXXXXXX` (9 chiffres après 237)

**Documentation officielle:** https://developer.notchpay.co

---

## 2. Prérequis et Configuration

### 2.1 Créer un compte NotchPay

1. Rendez-vous sur [business.notchpay.co](https://business.notchpay.co)
2. Créez un compte marchand
3. Complétez la vérification (KYC) pour la production

### 2.2 Obtenir les clés API

**En mode Test (Sandbox):**
- Dashboard → Settings → API Keys
- Clé publique: `pk_test_xxxxxxxxxxxx` (préfixe `pk_test_`)
- Utilisez cette clé pendant le développement

**En mode Production:**
- Clé publique: `pk_live_xxxxxxxxxxxx`
- **⚠️ Ne jamais exposer la clé secrète (sk_) côté client**

### 2.3 Variables d'environnement

Créez un fichier `.env` à la racine (à ne pas committer):

```env
# NotchPay - Test
VITE_NOTCHPAY_PUBLIC_KEY=pk_test_votre_cle_test

# NotchPay - Production (uncomment pour prod)
# VITE_NOTCHPAY_PUBLIC_KEY=pk_live_votre_cle_prod

# URL de callback après paiement (votre domaine)
VITE_APP_URL=https://votre-app.vercel.app
```

> **Important:** Les appels à l'API NotchPay doivent être faits depuis un **backend** pour des raisons de sécurité. La clé publique peut être utilisée côté client uniquement pour des flux "Collect" (redirection vers page NotchPay).

---

## 3. Architecture d'intégration

### Option A: Collect (Recommandé pour démarrage rapide)

L'utilisateur est redirigé vers la page de paiement hébergée par NotchPay. Pas de gestion de formulaire côté vous.

```
[Votre App] → POST /payments (init) → Redirect vers authorization_url → [NotchPay] → Callback vers votre site
```

### Option B: Intégration directe (Plus de contrôle UX)

L'utilisateur reste sur votre site. Vous collectez le numéro et l'opérateur, puis appelez l'API.

```
[Votre App] → POST /payments (init) → POST /payments/{ref} (process avec phone) → Webhook notification
```

**Pour l'application Vote IAI**, l'Option B est adaptée car vous avez déjà un formulaire de paiement (PaymentModal).

---

## 4. Implémentation Frontend

### 4.1 Service API NotchPay

Créez `src/lib/notchpay.ts`:

```typescript
const NOTCHPAY_API = 'https://api.notchpay.co';

export interface NotchPayInitPaymentParams {
  amount: number;        // En XAF
  currency: 'XAF';
  email: string;
  phone?: string;        // Format: 237670000000
  description: string;
  reference: string;     // Unique par transaction
  callback: string;      // URL de retour
  locked_channel?: string;  // 'cm.mtn' | 'cm.orange'
  locked_country?: 'CM';
  customer_meta?: Record<string, unknown>;
}

export interface NotchPayInitResponse {
  status: string;
  message: string;
  code: number;
  transaction?: { reference: string };
  authorization_url?: string;
}

export interface NotchPayProcessParams {
  channel: 'cm.mtn' | 'cm.orange';
  data: { phone: string };  // Format: +237670000000
}

// Cette fonction doit être appelée depuis votre BACKEND
export async function initNotchPayPayment(
  apiKey: string,
  params: NotchPayInitPaymentParams
): Promise<NotchPayInitResponse> {
  const res = await fetch(`${NOTCHPAY_API}/payments`, {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      email: params.email,
      phone: params.phone ? `237${params.phone.replace(/\D/g, '')}` : undefined,
      description: params.description,
      reference: params.reference,
      callback: params.callback,
      locked_channel: params.locked_channel,
      locked_country: params.locked_country ?? 'CM',
      customer_meta: params.customer_meta,
    }),
  });
  return res.json();
}
```

### 4.2 Format du numéro de téléphone Cameroun

| Opérateur | Préfixe | Exemple valide |
|-----------|---------|----------------|
| MTN       | 67, 68  | +237670000000 |
| Orange    | 69, 65  | +237690000000 |
| Format    | 6X XXXXXXX | 9 chiffres |

Validation côté client:
```typescript
const CAMEROON_PHONE_REGEX = /^(6[5-9]|62)\d{7}$/;
const formatForNotchPay = (local: string) => `237${local.replace(/\D/g, '')}`;
```

### 4.3 Adapter PaymentModal.tsx

Remplacez la simulation par un appel à votre API backend:

```typescript
// Au lieu de:
setTimeout(() => {
  setIsLoading(false);
  setStep(3);
  setShowConfetti(true);
  onSuccess(candidateId, selectedPack.votes);
}, 2000);

// Utiliser:
const channel = paymentProvider === 'orange' ? 'cm.orange' : 'cm.mtn';
const phoneFormatted = `237${phoneNumber.replace(/\D/g, '')}`;

const response = await fetch('/api/votes/pay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    candidateId,
    packId: selectedPackId,
    amount: selectedPack?.price,
    channel,
    phone: phoneFormatted,
    email: 'voter@iai.cm', // À collecter si possible
  }),
});

const data = await response.json();
if (data.success) {
  setStep(3);
  setShowConfetti(true);
  onSuccess(candidateId, selectedPack.votes);
} else {
  setError(data.message || 'Paiement échoué');
}
```

---

## 5. Backend / API

### 5.1 Endpoint d'initialisation + traitement

Vous devez créer un endpoint backend (Node.js, etc.) qui:
1. Reçoit: `candidateId`, `packId`, `amount`, `channel`, `phone`, `email`
2. Génère une référence unique: `vote_${candidateId}_${Date.now()}`
3. Appelle NotchPay `POST /payments` avec la clé **secrète**
4. Si mode Collect: retourne `authorization_url` pour redirection
5. Si mode Direct: appelle `POST /payments/{ref}` pour process avec Mobile Money

Exemple Node.js/Express:

```javascript
// POST /api/votes/pay
const crypto = require('crypto');

app.post('/api/votes/pay', async (req, res) => {
  const { candidateId, packId, amount, channel, phone, email } = req.body;
  const reference = `vote_${candidateId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  // 1. Initialize payment
  const initRes = await fetch('https://api.notchpay.co/payments', {
    method: 'POST',
    headers: {
      'Authorization': process.env.NOTCHPAY_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Number(amount),
      currency: 'XAF',
      email: email || 'contact@iai.cm',
      description: `Vote pour candidat ${candidateId}`,
      reference,
      callback: `${process.env.APP_URL}/vote/callback`,
      locked_channel: channel,
      locked_country: 'CM',
      customer_meta: { candidateId, packId },
    }),
  });

  const initData = await initRes.json();
  if (initData.code !== 201) {
    return res.status(400).json({ success: false, message: initData.message });
  }

  const paymentRef = initData.transaction?.reference;

  // 2. Process with Mobile Money
  const processRes = await fetch(`https://api.notchpay.co/payments/${paymentRef}`, {
    method: 'POST',
    headers: {
      'Authorization': process.env.NOTCHPAY_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel,
      data: { phone: `+${phone}` },
    }),
  });

  const processData = await processRes.json();

  if (processData.status === 'Accepted' || processData.code === 201) {
    return res.json({
      success: true,
      reference,
      message: 'Paiement initié. Confirmez sur votre téléphone.',
    });
  }

  return res.status(400).json({
    success: false,
    message: processData.message || 'Échec du paiement',
  });
});
```

### 5.2 Endpoint de callback (Webhook)

NotchPay envoie un webhook lors du statut final (success/failed). Créez un endpoint pour le recevoir:

```javascript
// POST /api/webhooks/notchpay
app.post('/api/webhooks/notchpay', async (req, res) => {
  const signature = req.headers['x-notch-signature'];
  const payload = JSON.stringify(req.body);

  // Vérifier la signature (voir doc NotchPay)
  // ...

  const { event, transaction } = req.body;
  if (event === 'payment.complete') {
    const { reference, amount, customer_meta } = transaction;
    // Enregistrer le vote en base de données
    // customer_meta.candidateId, customer_meta.packId
  }

  res.status(200).send('OK');
});
```

---

## 6. Channels Mobile Money Cameroun

| Opérateur | Channel Code | Préfixe téléphone | Exemple test succès |
|-----------|--------------|-------------------|---------------------|
| MTN       | `cm.mtn`     | 67, 68            | +237670000000       |
| Orange    | `cm.orange`  | 69, 65            | +237690000000       |
| EU Mobile | `eumm`       | 68                | +237680000000       |
| Yoomee    | `cm.yoomee`  | 66                | +237660000000       |

### Numéros de test (Sandbox)

| Numéro | Résultat |
|--------|----------|
| +237670000000 | Succès |
| +237670000001 | Fonds insuffisants |
| +237670000002 | Échec (autre) |
| +237670000003 | Timeout |
| +237670000004 | Annulé par l'utilisateur |

Même logique pour Orange: remplacer 67 par 69 (ex: +237690000000).

---

## 7. Tests

### Checklist de test

- [ ] Paiement MTN réussi
- [ ] Paiement Orange réussi
- [ ] Gestion fonds insuffisants (+237670000001)
- [ ] Gestion timeout (+237670000003)
- [ ] Gestion annulation (+237670000004)
- [ ] Validation numéro invalide
- [ ] Callback/Webhook reçu et traité
- [ ] Confetti + étape succès après paiement réussi

### Tester les webhooks en local

Utilisez [ngrok](https://ngrok.com/) pour exposer votre localhost:
```bash
ngrok http 5173
```
Puis configurez l'URL ngrok dans le dashboard NotchPay (Webhooks).

---

## 8. Webhooks

1. Dashboard NotchPay → Webhooks → Create
2. URL: `https://votre-api.com/api/webhooks/notchpay`
3. Événements: `payment.complete`, `payment.failed`
4. Conservez le **Webhook Hash Key** (`hsk_test_` ou `hsk_live_`) pour vérifier les signatures.

Vérification de signature (Node.js):
```javascript
const crypto = require('crypto');
const isValid = (payload, signature, secret) => {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return signature === expected;
};
```

---

## 9. Gestion des erreurs

| Code/Message | Action côté UI |
|--------------|----------------|
| INVALID_PHONE | "Numéro invalide. Format: 6XXXXXXXX" |
| UNREGISTERED_PHONE | "Ce numéro n'est pas enregistré sur Mobile Money." |
| INSUFFICIENT_BALANCE | "Solde insuffisant. Rechargez votre compte." |
| TIMEOUT | "Pas de réponse. Vérifiez votre téléphone et réessayez." |
| CANCELLED_BY_USER | "Paiement annulé." |
| PROVIDER_ERROR | "Erreur temporaire. Réessayez dans quelques minutes." |

---

## 10. Passage en production

1. Compléter la vérification du compte NotchPay (KYC)
2. Remplacer les clés test par les clés live
3. Mettre à jour les URLs de callback et webhooks
4. Tester avec un petit montant réel
5. Ne jamais envoyer toutes les transactions vers le même numéro (détection de fraude)
6. Surveiller le dashboard et les logs

---

## 📚 Ressources

- [Documentation NotchPay](https://developer.notchpay.co)
- [Initialize Payment API](https://developer.notchpay.co/api-reference/initialize-a-payment)
- [Mobile Money Guide](https://developer.notchpay.co/accept-payments/mobile-money)
- [Testing Guide](https://developer.notchpay.co/get-started/testing)
- [Webhooks](https://developer.notchpay.co/get-started/webhooks)

---

*Document créé pour l'application Vote IAI-Cameroun. Dernière mise à jour: Février 2025.*
