# Guide pas à pas – Déploiement et NotchPay

Ce guide décrit les étapes **externes** (en dehors du code) pour faire fonctionner l’application Vote IAI avec le paiement NotchPay, Vercel et Railway.

---

## 1. Structure du projet (déjà faite)

```
University-contest-app-iai/
├── frontend/          ← App React (Vite). Déployée sur Vercel.
├── server/            ← API Express + NotchPay. Déployée sur Railway.
├── docs/              ← Documentation (dont ce guide).
└── *.md               ← Autres docs (analyse UI/UX, etc.) à la racine.
```

**Vercel et le dossier `frontend`**  
Mettre l’app dans un sous-dossier **ne casse pas** Vercel. Il suffit de définir le **Root Directory** sur `frontend` dans les paramètres du projet Vercel. Le build et le déploiement se feront depuis ce dossier.

---

## 2. Compte et clés NotchPay

### 2.1 Créer un compte

1. Aller sur **[business.notchpay.co](https://business.notchpay.co)**.
2. S’inscrire (compte marchand).
3. Pour la **production**, compléter la vérification (KYC) si demandée.

### 2.2 Récupérer les clés API

1. Dans le dashboard, passer en **mode Sandbox (Test)** (sélecteur en haut).
2. Aller dans **Settings** → **API Keys**.
3. Copier :
   - **Secret Key** (ex. `sk_test_...`) → pour le **backend uniquement**.
   - (La clé publique `pk_test_...` n’est pas utilisée dans l’Option B côté backend.)

À noter : en production, utiliser les clés **live** (`sk_live_...`).

---

## 3. Backend sur Railway

### 3.1 Créer le projet

1. Aller sur **[railway.app](https://railway.app)** et se connecter (ex. GitHub).
2. **New Project** → **Deploy from GitHub repo**.
3. Choisir le dépôt `University-contest-app-iai`.
4. Railway détecte souvent un seul `package.json`. Il faut indiquer que l’app à lancer est dans **server**.

### 3.2 Configurer le service “server”

1. Dans le projet Railway, ouvrir le service créé.
2. **Settings** (ou **Variables**) :
   - **Root Directory** : `server`  
     (pour que Railway exécute `npm install` et `npm start` dans `server/`).
3. **Variables** (onglet Variables) :
   - `NOTCHPAY_SECRET_KEY` = votre clé secrète (ex. `sk_test_...`).
   - `APP_URL` = URL du frontend (ex. `https://votre-app.vercel.app`).
4. **Build** :  
   - Build command : `npm install` (ou laisser par défaut).  
   - Start command : `npm start` (défini dans `server/package.json`).

### 3.3 Domaine public

1. Dans le service, onglet **Settings** → **Networking** (ou **Generate Domain**).
2. Générer un domaine public (ex. `vote-iai-api.railway.app`).
3. **Copier cette URL** : ce sera `VITE_API_URL` côté frontend (ex. `https://vote-iai-api.railway.app`).

### 3.4 Vérifier le backend

- Ouvrir `https://VOTRE-DOMAINE-RAILWAY.app/health` dans le navigateur.  
- Réponse attendue : `{"ok":true,"service":"vote-iai-api"}`.

---

## 4. Frontend sur Vercel

### 4.1 Connexion du repo

1. Aller sur **[vercel.com](https://vercel.com)** et se connecter (ex. GitHub).
2. **Add New** → **Project** → importer `University-contest-app-iai`.

### 4.2 Root Directory

1. Dans **Configure Project** (ou **Settings** du projet), section **Root Directory**.
2. Choisir **frontend** (ou taper `frontend`).
3. Vercel utilisera ce dossier pour le build (Framework Preset = Vite si détecté).

### 4.3 Variable d’environnement

1. **Settings** → **Environment Variables**.
2. Ajouter :
   - **Name** : `VITE_API_URL`
   - **Value** : l’URL Railway (ex. `https://vote-iai-api.railway.app`) **sans** slash final.
3. Appliquer à **Production** (et **Preview** si vous voulez les mêmes appels en preview).

### 4.4 Redéploiement

Après avoir ajouté `VITE_API_URL`, lancer un **Redeploy** pour que la nouvelle variable soit prise en compte.

---

## 5. Webhook NotchPay (optionnel mais recommandé)

Pour que le statut “paiement réussi” soit bien pris en compte même si l’utilisateur ferme la page, configurez un webhook NotchPay vers votre backend.

1. Dashboard NotchPay → **Settings** ou **Developers** → **Webhooks**.
2. **Add webhook** :
   - **URL** : `https://VOTRE-DOMAINE-RAILWAY.app/api/webhooks/notchpay`
   - **Events** : cocher au minimum `payment.complete` et `payment.failed`.
3. Sauvegarder. NotchPay enverra les statuts à cette URL ; le backend met à jour le store et le frontend peut récupérer le statut via `/api/payments/:reference/status`.

---

## 6. Tests en sandbox

1. **Backend** : `NOTCHPAY_SECRET_KEY` = clé **test** (`sk_test_...`).
2. **Frontend** : `VITE_API_URL` = URL Railway du backend.
3. Sur l’app (Vercel ou `npm run dev` dans `frontend`), lancer un vote et payer avec un **numéro de test** NotchPay (ex. pour le Cameroun MTN : `+237670000000` = succès).  
4. Vérifier que le flux “Paiement envoyé → Confirmez sur votre téléphone” s’affiche et que le statut passe à “Vote enregistré” après confirmation (ou après webhook).

---

## 7. Résumé des variables

| Où        | Variable               | Exemple (prod)                          |
|-----------|------------------------|-----------------------------------------|
| Railway   | `NOTCHPAY_SECRET_KEY`  | `sk_live_...` ou `sk_test_...`          |
| Railway   | `APP_URL`              | `https://votre-app.vercel.app`          |
| Vercel    | `VITE_API_URL`         | `https://vote-iai-api.railway.app`      |

---

## 8. Dépannage rapide

- **“Paiement non configuré”** : `NOTCHPAY_SECRET_KEY` manquante ou incorrecte sur Railway.
- **Erreur réseau / CORS** : vérifier que `APP_URL` (Railway) correspond exactement au domaine Vercel (sans slash final) et que CORS est bien activé côté backend (déjà le cas dans `server/index.js`).
- **404 sur /api/...** : en local, lancer le serveur dans `server/` (`npm run dev`) et garder `VITE_API_URL` vide pour utiliser le proxy Vite vers `http://localhost:3000`.

Une fois ces étapes faites, l’intégration NotchPay (Option B) est opérationnelle avec le SDK côté backend et le frontend dans `frontend/` déployé sur Vercel.
