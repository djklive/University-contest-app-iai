# Accès à l’admin – Vote IAI

## Comment y accéder

L’admin est une **application séparée** (`frontend-admin`), déployée à part (ex. sur Vercel).

1. **URL** : celle de ton déploiement admin (ex. `https://vote-iai-admin.vercel.app`).
2. **Authentification** : à l’ouverture, une page demande le **secret admin**. C’est la valeur de la variable d’environnement **`ADMIN_SECRET`** du **backend** (celle que tu as configurée sur Railway ou en local). Tu ne crées pas de compte : tu entres ce secret une fois par session (il est stocké en `sessionStorage`).
3. Une fois le secret validé (le backend renvoie 200 sur une requête admin), tu accèdes au **dashboard** avec les onglets Candidats, Packs de vote, Paiements, Votes.

## Déploiement (Vercel)

1. Dans Vercel, crée un **nouveau projet** et importe le repo (ou uniquement le dossier `frontend-admin` si tu as un monorepo).
2. **Root Directory** : `frontend-admin`.
3. **Build** : `npm run build` (ou `npm ci && npm run build`).
4. **Variables d’environnement** : ajoute **`VITE_API_URL`** = URL de ton backend (ex. `https://vote-iai-api.up.railway.app`). Sans ça, l’admin ne sait pas vers quel API envoyer les requêtes.
5. Déploie. L’URL du projet (ex. `https://vote-iai-admin.vercel.app`) est l’URL d’accès à l’admin.

## Sécurité

- **Ne pas exposer `ADMIN_SECRET`** côté frontend : il n’est jamais stocké dans le code ni dans le build. L’utilisateur le saisit à la main à chaque connexion (ou une fois par session).
- Le backend vérifie à chaque requête admin le header **`x-admin-secret`** ; s’il ne correspond pas à `ADMIN_SECRET`, il renvoie 401.
- En production, utilise un secret fort (généré aléatoirement) et communique-le uniquement aux personnes autorisées (ex. par un canal sécurisé).

## Fonctions disponibles

| Section       | Actions |
|---------------|--------|
| **Candidats** | Liste, ajout, modification, suppression (CRUD). Champs : nom, catégorie, photo URL, biographie, galerie, vidéo. |
| **Packs de vote** | Liste, ajout, modification, suppression (CRUD). Champs : id, nombre de votes, prix FCFA, populaire. |
| **Paiements** | Liste en lecture seule (référence, statut, candidat, pack, montant, votes, date). Filtre par statut (pending, complete, failed). |
| **Votes**     | Liste en lecture seule (référence paiement, candidat, catégorie, nombre de votes, montant, date). |

## Résumé

- **Accès** : URL du frontend-admin + saisie du secret admin (valeur de `ADMIN_SECRET` du backend).
- **Déploiement** : projet Vercel avec root `frontend-admin` et variable `VITE_API_URL` = URL du backend.
- **Pas de compte utilisateur** : uniquement ce secret partagé entre les admins.
