# Utiliser Supabase (PostgreSQL) comme base de données

Ce projet peut utiliser **Supabase** comme base PostgreSQL à la place de Railway (ou en local).

---

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → crée un projet (région au choix, ex. `eu-west-1`).
2. Une fois le projet créé, va dans **Settings → Database**.
3. Récupère :
   - Le **mot de passe** de l’utilisateur `postgres` (celui défini à la création du projet, ou réinitialise-le).
   - L’**URI de connexion** (Connection string). Pour l’app Node, utilise la **Connection pooling** (mode Session ou Transaction) avec le **pooler** :
     - Host du type : `aws-0-eu-west-1.pooler.supabase.com` (ou `aws-1-eu-west-1.pooler.supabase.com` selon la région).
     - Port : **5432** (session) ou **6543** (transaction).

---

## 2. Format de `DATABASE_URL` pour Supabase

Utilise l’URL **pooler** (recommandée pour un serveur Node) :

```
postgresql://postgres.PROJECT_REF:TON_MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

- Remplace **PROJECT_REF** par la référence du projet (ex. `rnzvssyqoqarhutpkwva`).
- Remplace **TON_MOT_DE_PASSE** par le mot de passe de l’utilisateur `postgres`.
- Remplace **aws-0-eu-west-1** par ta région si différente (ex. `aws-1-eu-west-1`).
- **Important** : garde **`?sslmode=require`** à la fin (Supabase exige SSL).

Si le mot de passe contient des caractères spéciaux (`@`, `#`, `%`, `&`, etc.), encode-les dans l’URL :
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`

Exemple (ton projet) :

```
postgresql://postgres.rnzvssyqoqarhutpkwva:TON_MOT_DE_PASSE@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

---

## 3. Où configurer

- **En local** : dans `server/.env`, définis `DATABASE_URL` avec l’URL ci-dessus (et ton vrai mot de passe).
- **Sur un hébergeur** (Railway, Vercel, etc.) : ajoute la variable d’environnement `DATABASE_URL` avec la même URL (sans la commiter dans le repo).

---

## 4. Migrations et seed

Une fois `DATABASE_URL` pointant vers Supabase :

```bash
cd server
npx prisma migrate deploy
npx prisma db seed
```

Cela crée les tables et insère les candidats + packs de vote.

---

## 5. SSL (déjà géré par l’URL)

Le paramètre **`?sslmode=require`** dans l’URL suffit pour Supabase. Si tu avais une erreur de certificat, tu pourrais ajouter dans `db.js` `ssl: { rejectUnauthorized: false }` dans l’adaptateur, mais en général ce n’est pas nécessaire avec le pooler Supabase.

---

## 6. Résumé

| Étape | Action |
|--------|--------|
| 1 | Créer un projet Supabase, noter le mot de passe et l’host pooler |
| 2 | Mettre `DATABASE_URL` avec l’URL pooler + `?sslmode=require` (dans `.env` ou variables d’environnement) |
| 3 | Exécuter `npx prisma migrate deploy` puis `npx prisma db seed` depuis `server/` |

Aucun changement de code n’est nécessaire : Prisma et l’adaptateur pg utilisent déjà `DATABASE_URL` ; il suffit qu’elle pointe vers Supabase.
