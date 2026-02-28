# Admin Vote IAI

Interface d'administration pour le site de vote (CRUD candidats, packs, consultation paiements/votes).

## Acces

1. Ouvrir l'URL du deploiement (ex. Vercel).
2. Saisir le **secret admin** (variable `ADMIN_SECRET` du backend).
3. Acces au dashboard (Candidats, Packs, Paiements, Votes).

## Dev local

```bash
cd frontend-admin
npm install
cp .env.example .env
# Editer .env : VITE_API_URL=http://localhost:3000
npm run dev
```

Ouvrir http://localhost:5174

## Build / Vercel

- Root directory: `frontend-admin`
- Build command: `npm run build`
- Variable: `VITE_API_URL` = URL du backend (ex. https://vote-iai-api.up.railway.app)

Voir aussi `docs/ADMIN_ACCES.md`.
 