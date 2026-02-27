# Analyse – Données réelles et automatisation

Ce document recense ce qui est aujourd’hui **mock** ou **local** et ce qu’il faudrait **persister / dynamiser** pour une app en production avec de vraies données.

---

## 1. État actuel (mock / local)

| Donnée | Où c’est utilisé | Stockage actuel |
|--------|-------------------|------------------|
| **Candidats** | Galerie, profil, dashboard | `frontend/src/lib/mockData.ts` (liste en dur) |
| **Votes par candidat** | Cartes, profil, dashboard, classements | État React (`votes` dans `App.tsx`) → perdu au rechargement |
| **Packs de vote** | Modal de paiement | `mockData.ts` (votePacks) |
| **Favoris** | Onglet Favoris, cœur sur les cartes | `localStorage` (persistant mais par appareil/navigateur) |
| **Paiements** | Référence + statut pendant le flux | Backend : store en mémoire → perdu au redémarrage du serveur |
| **Stats globales** | Dashboard (total votes, Miss/Master, graphiques) | Calculées à partir des votes React + votes des candidats dans mockData |

---

## 2. Ce qu’il faudrait pour des données réelles

### 2.1 Backend / base de données

- **Base de données** (PostgreSQL, MongoDB, etc.) pour :
  - **Candidats** : id, nom, catégorie (miss/master), photo, biographie, badges, galerie, vidéo, etc.
  - **Votes** : enregistrer chaque vote validé (après paiement réussi) : `candidateId`, `reference`, `amount`, `votes_count`, `createdAt`, éventuellement `phone_hash` ou `user_id`.
  - **Paiements** : garder une trace des références et statuts (déjà partiellement fait en mémoire ; à persister en base pour historique et rejeu).

- **API backend** (en plus de `/api/votes/pay` et `/api/payments/:ref/status`) :
  - `GET /api/candidates` – liste des candidats (remplacer l’import mockData).
  - `GET /api/candidates/:id` – détail d’un candidat.
  - `GET /api/stats` ou intégrer dans candidates – totaux de votes par candidat, par catégorie, pour le dashboard.
  - Optionnel : `GET /api/votes` (pour un user) ou “mes votes” si vous ajoutez une notion d’utilisateur.

### 2.2 Votes

- **Aujourd’hui** : le paiement NotchPay réussit → le frontend appelle `onSuccess(candidateId, votes)` → mise à jour de l’état React uniquement.
- **À faire** : quand le webhook ou le polling indique `payment.complete`, le **backend** doit :
  - Enregistrer le vote en base (candidat, nombre de votes, référence de paiement).
  - Les stats (total par candidat, classements) sont alors calculées à partir de la base (ou d’une table agrégée), pas du mock.

### 2.3 Candidats

- Remplacer `candidates` et `votePacks` dans `mockData.ts` par des appels API vers le backend.
- Le backend lit les candidats (et les packs) depuis la base ; possibilité d’admin (CRUD candidats) plus tard.

### 2.4 Favoris

- **Option A** : garder le favoris en `localStorage` (simple, pas de compte).
- **Option B** : si vous avez des **comptes utilisateurs** (email/téléphone), stocker les favoris en base (table `user_favorites`) et exposer `GET/POST/DELETE /api/me/favorites`.

### 2.5 Dashboard (stats)

- **Aujourd’hui** : totaux et classements calculés côté frontend à partir de `votes` (React) + `candidate.votes` (mock).
- **À faire** : un endpoint du type `GET /api/stats` (ou des champs dans les candidats) qui renvoie :
  - Total des votes, par catégorie (Miss/Master), top N par catégorie, évolution si vous stockez des dates.
- Le frontend ne fait qu’afficher ces données.

### 2.6 Paiements et webhook

- Persister en base chaque paiement (référence, statut, candidateId, packId, montant, date).
- Dans le webhook NotchPay : à la réception de `payment.complete`, enregistrer le vote en base et mettre à jour le statut du paiement (au lieu de seulement mettre à jour le store en mémoire).
- Le polling `/api/payments/:reference/status` peut continuer à s’appuyer sur ce store en mémoire **ou** sur la base (statut lu depuis la table paiements).

---

## 3. Ordre de mise en œuvre suggéré

1. **Base de données + modèle**  
   Tables : `candidates`, `vote_packs`, `payments`, `votes` (au minimum).

2. **Backend**  
   - Endpoints : `GET /api/candidates`, `GET /api/candidates/:id`, `GET /api/stats` (ou équivalent).  
   - Lors du succès d’un paiement (webhook ou après vérification), insertion dans `votes` et mise à jour des stats / agrégats si besoin.

3. **Frontend**  
   - Remplacer l’import de `mockData` par des `fetch` vers `/api/candidates` et `/api/stats`.  
   - Garder le flux de paiement actuel ; seuls les votes “officiels” viennent de la base après paiement réussi.

4. **Favoris**  
   - Soit garder en localStorage, soit ajouter une API favoris une fois qu’un système d’utilisateur existe.

5. **Optionnel**  
   - Backoffice (admin) pour créer/éditer les candidats et les packs.  
   - Historique des paiements / votes par référence.

---

## 4. Résumé

| Besoin | Action |
|--------|--------|
| **Paiements réels** | Remplacer la clé NotchPay par la clé **live** sur Railway (voir [PASSAGE_EN_PRODUCTION.md](./PASSAGE_EN_PRODUCTION.md)). |
| **Stats / votes réels** | Base de données + API backend pour candidats, votes (après paiement), et stats ; frontend consomme ces API au lieu du mock. |
| **Favoris** | Rester en localStorage ou les déplacer en base quand un système utilisateur existe. |
| **Candidats dynamiques** | Backend + BDD + `GET /api/candidates` ; plus de liste en dur dans le frontend. |

Cette analyse peut servir de cahier des charges minimal pour “automatiser / dynamiser” les données (stats, votes, favoris, candidats) et préparer une vraie mise en production données.

---

## 5. Choix retenus (implémentation)

- **Favoris** : conservés en **localStorage** uniquement. Aucun compte utilisateur sur le site de vote ; pas d'API favoris côté backend.
- **Admin** : pas de comptes pour les visiteurs/votants. L'administration (CRUD candidats) est protégée par un **secret unique** : variable d'environnement `ADMIN_SECRET`, header `x-admin-secret` sur les routes `/api/admin/*`. Aucune table « utilisateurs » n'est requise pour les votants.
