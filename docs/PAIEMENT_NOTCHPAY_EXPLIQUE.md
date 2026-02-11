# Paiement NotchPay – Ce qui se passe vraiment

## Orange et MTN sont-ils acceptés ?

Oui. NotchPay accepte les deux au Cameroun :
- **Orange Money** → channel `cm.orange`
- **MTN MoMo** → channel `cm.mtn`

Le choix dans la modal (Orange / MTN) envoie le bon `channel` au backend, qui le transmet à NotchPay.

---

## Déroulement du paiement (étape par étape)

1. **Utilisateur** : Choisit un pack (ex. 5 votes), sélectionne Orange ou MTN, entre son numéro (ex. 670000000) et clique sur « Payer ».

2. **Frontend** : Envoie à **votre backend** (Railway) :  
   `POST /api/votes/pay` avec `{ candidateId, packId, amount, channel, phone }`.

3. **Backend** :
   - Crée un paiement chez NotchPay (`POST https://api.notchpay.co/payments`).
   - Envoie la demande Mobile Money à NotchPay (`PUT .../payments/{ref}` avec le numéro et le channel).
   - Répond au frontend : `{ success: true, reference: "vote_..." }`.

4. **NotchPay** : Envoie une **requête USSD / push** sur le téléphone du numéro saisi. L’utilisateur voit « Confirmez le paiement de X FCFA » sur son téléphone (MTN ou Orange).

5. **Utilisateur** : Accepte ou refuse sur son téléphone (en général dans les 30–60 secondes).

6. **Frontend** : Affiche « Paiement envoyé ! Confirmez sur votre téléphone » et **interroge** le backend toutes les 2,5 s :  
   `GET /api/payments/{reference}/status`.  
   - Si le backend renvoie `status: 'complete'` (grâce au webhook ou au polling côté backend), la modal passe à l’étape « Succès » et les votes sont ajoutés.  
   - Si `status: 'failed'` ou timeout, un message d’erreur s’affiche.

7. **Webhook (recommandé)** : NotchPay envoie aussi un webhook à votre backend (`POST /api/webhooks/notchpay`) quand le paiement est réussi ou échoué. Le backend met alors à jour le statut en mémoire, et le prochain appel `/api/payments/{reference}/status` renvoie `complete` ou `failed`.

---

## À quoi s’attendre en test (sandbox)

- Avec un **numéro de test** NotchPay (ex. `670000000` pour MTN Cameroun) : la demande est simulée, pas d’argent réel.
- Vous pouvez voir « Paiement envoyé ! Confirmez sur votre téléphone » puis, après un délai (ou immédiatement en sandbox), soit le succès soit un message d’échec selon le numéro de test utilisé.
- En **production** avec un vrai numéro : l’utilisateur reçoit vraiment la demande sur son téléphone MTN ou Orange et doit accepter pour que le paiement soit validé.

---

## Erreurs fréquentes

### « POST .../api/votes/pay 400 (Bad Request) »

- Le backend exige : `candidateId`, `packId`, `amount`, `channel`, `phone`.
- Causes possibles : numéro invalide (format 6XXXXXXXX), ou un champ manquant. Vérifier que le **moyen de paiement est bien sélectionné** (Orange ou MTN) pour que `channel` soit envoyé (par défaut Orange est sélectionné).

### « POST https://votre-site.vercel.app/...railway.app/api/votes/pay 404 »

- L’URL d’API était traitée comme **chemin relatif** au lieu d’URL absolue.
- **À faire sur Vercel** : variable d’environnement `VITE_API_URL` = URL **complète** du backend, par ex.  
  `https://university-contest-app-iai-production.up.railway.app`  
  (avec `https://`, sans slash final). Puis **redéployer** le frontend.

### « Could not establish connection. Receiving end does not exist »

- C’est en général une **extension de navigateur** (ex. Cursor, React DevTools, bloqueur de pub), pas votre app. Vous pouvez l’ignorer.

### Railway : « Stopping Container » / SIGTERM dans les logs

- Au redéploiement ou au redémarrage du service, Railway arrête l’ancien conteneur (SIGTERM). C’est normal. « Server running on port 8080 » indique que le nouveau conteneur a bien démarré.

---

## Récap

- **Orange et MTN** : tous deux gérés via NotchPay (`cm.orange` / `cm.mtn`).
- **Flux** : Frontend → Backend → NotchPay → demande sur le téléphone → utilisateur accepte/refuse → webhook ou polling → frontend affiche succès ou échec.
- **Production** : `VITE_API_URL` sur Vercel doit être l’URL complète du backend (avec `https://`).
