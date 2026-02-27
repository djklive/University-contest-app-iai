# Passage en production – Paiements réels

## Accepter de vrais paiements avec NotchPay

1. **Compte NotchPay** : Complétez la vérification (KYC) sur business.notchpay.co si nécessaire.

2. **Clé API production** :
   - Passez en **mode Production** dans le dashboard NotchPay.
   - Settings → API Keys → copiez la **Secret Key** live (préfixe `sk_live_...`).

3. **Configuration** :
   - **Railway** : Remplacez la variable `NOTCHPAY_SECRET_KEY` par la clé **live** (`sk_live_...`).
   - Redéployez le backend. Aucun changement côté frontend.

4. **Webhook** : En production, configurez dans NotchPay l’URL `https://VOTRE-BACKEND.up.railway.app/api/webhooks/notchpay` pour les événements payment.complete et payment.failed.

**En résumé** : il suffit de changer la clé API NotchPay (test → live) sur Railway pour passer aux paiements réels.
