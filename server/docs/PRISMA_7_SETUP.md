# Configuration Prisma 7 – résumé

## Modifications effectuées

1. **prisma/schema.prisma**  
   - Pas de `url` dans le bloc `datasource` (obligatoire en Prisma 7).  
   - `generator` avec `provider = "prisma-client"` et `output = "../generated/prisma"`.

2. **prisma.config.ts**  
   - `datasource.url` = `env("DATABASE_URL")` (utilisé par la CLI pour les migrations).  
   - `migrations.path` et `migrations.seed` configurés.

3. **package.json**  
   - `prisma` et `@prisma/client` en **7.4.1**.  
   - Dépendance **pg** ajoutée (utilisée par `@prisma/adapter-pg`).  
   - Clé `prisma.seed` retirée (le seed est défini dans `prisma.config.ts`).

4. **db.js**  
   - Import de `PrismaClient` depuis `./generated/prisma/client.js`.  
   - Création du client avec l’adaptateur pg :  
     `new PrismaPg({ connectionString: process.env.DATABASE_URL })` puis  
     `new PrismaClient({ adapter })`.

5. **prisma/seed.js**  
   - Même schéma : import depuis `../generated/prisma/client.js` et utilisation de l’adaptateur.

## Commandes à lancer

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

## Si l’import du client échoue

Si tu as une erreur du type « Cannot find module './generated/prisma/client.js' » :

- Vérifie que `npx prisma generate` a bien créé le dossier `generated/prisma`.
- Selon la version de Prisma 7, l’entrée peut être :
  - `generated/prisma/client.js`, ou
  - `generated/prisma/index.js`.
- Dans ce cas, dans `db.js` et `prisma/seed.js`, remplace `client.js` par le bon fichier (par ex. `index.js`).

## Connexion SSL (Railway, etc.)

Si tu as une erreur de certificat SSL en production, utilise :

```js
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
```

(À réserver à un environnement de confiance ou à une config SSL correcte.)
