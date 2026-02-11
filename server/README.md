# Backend Vote IAI (NotchPay)

API Express pour l'application de vote IAI. Gère les paiements Mobile Money (MTN, Orange) via **NotchPay** (Option B – intégration directe) en appelant l’API REST NotchPay (sans SDK npm).

## Installation

```bash
cd server
npm install
```

## Variables d'environnement

Copier `.env.example` vers `.env` et renseigner:

- `NOTCHPAY_SECRET_KEY` — Clé secrète NotchPay (sk_test_... ou sk_live_...)
- `APP_URL` — URL du frontend (ex. http://localhost:5173 ou https://votre-app.vercel.app)

## Lancer en local

```bash
npm run dev
```

Le serveur écoute sur le port 3000 (ou `PORT`). Le frontend Vite proxy les requêtes `/api` vers ce serveur si `VITE_API_URL` est vide.

## Endpoints

- `POST /api/votes/pay` — Créer un paiement et lancer le Mobile Money (body: candidateId, packId, amount, channel, phone, email?)
- `GET /api/payments/:reference/status` — Statut d'un paiement (pour le polling)
- `POST /api/webhooks/notchpay` — Webhook NotchPay (payment.complete / payment.failed)
- `GET /health` — Health check (Railway)

## Déploiement (Railway)

1. Root Directory du service = `server`
2. Variables: `NOTCHPAY_SECRET_KEY`, `APP_URL`
3. Build: `npm install` — Start: `npm start`

Voir [../docs/GUIDE_PAS_A_PAS.md](../docs/GUIDE_PAS_A_PAS.md) pour le guide complet.
