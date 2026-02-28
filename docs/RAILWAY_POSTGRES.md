# Connecter le backend Railway à PostgreSQL (Postgres / postgres-volume)

Quand tu as créé un **service PostgreSQL** (ou postgres-volume) à côté de ton backend sur Railway, il faut donner au backend l’URL de connexion. Voici comment.

---

## 0. Postgres vs Volume : pas de « mount » pour la base

- **Service PostgreSQL** (ex. « postgres-volume ») : c’est la **base de données**. Le backend s’y connecte **via une URL** (`DATABASE_URL`). Rien à « monter » pour la connexion.
- **Volume** (RAILWAY_VOLUME_MOUNT_PATH, etc.) : **disque persistant** pour fichiers (uploads, cache), pas pour Postgres. Un mount sur le backend (ex. `/server`) est optionnel.
- Pour que l’app utilise la base : le **service backend** doit avoir `DATABASE_URL` qui référence le **service Postgres** (section 1).

---

## 1. Référencer la base depuis le service backend

Railway expose les variables du service Postgres. Tu ne copies pas l’URL à la main : tu **références** la variable du service Postgres.

1. Ouvre ton **projet** sur [railway.app](https://railway.app) → sélectionne le **service backend** (ton API Node).
2. Onglet **Variables** (ou **Settings** → Variables).
3. Ajoute une variable :
   - **Nom :** `DATABASE_URL`
   - **Valeur :**  
     `${{NOM_DU_SERVICE_POSTGRES.DATABASE_PRIVATE_URL}}`

Remplace **NOM_DU_SERVICE_POSTGRES** par le nom exact du service Postgres dans le projet (ex. `Postgres`, `postgres-volume`, `postgresql`, etc.). Tu le vois dans la liste des services du projet.

**Exemples :**

- Si le service s’appelle **Postgres** :  
  `${{Postgres.DATABASE_PRIVATE_URL}}`
- S’il s’appelle **postgres-volume** :  
  `${{postgres-volume.DATABASE_PRIVATE_URL}}`

Utiliser **DATABASE_PRIVATE_URL** (et pas `DATABASE_URL` public) est recommandé pour que le backend parle à la base **en interne** sur Railway, sans passer par Internet.

---

## 2. Trouver le nom du service Postgres

- Dans le projet Railway : liste des services à gauche.
- Le nom s’affiche sous l’icône du service (Postgres / postgres-volume / etc.).
- Tu peux aussi cliquer sur le service Postgres → **Variables** : tu verras les noms des variables (ex. `DATABASE_PRIVATE_URL`). Le nom du service est celui utilisé dans `${{NomService.VARIABLE}}`.

---

## 3. Quelle URL utiliser

| Variable | Usage |
|----------|--------|
| **DATABASE_PRIVATE_URL** | Backend **dans le même projet** Railway → à utiliser pour `DATABASE_URL` du backend. |
| DATABASE_URL (public) | Connexions **externes** (ex. pgAdmin depuis ta machine, outil de backup). |

Donc pour ton backend sur Railway, définir :

```bash
DATABASE_URL=${{Postgres.DATABASE_PRIVATE_URL}}
```

(avec le bon nom de service à la place de `Postgres` si besoin.)

---

## 4. Après avoir mis la variable

1. **Sauvegarde** les variables du service backend.
2. Railway **redéploie** le backend. Au prochain déploiement, `DATABASE_URL` sera bien remplie par l’URL privée Postgres.
3. **Migrations** : le script `start` du backend exécute `prisma migrate deploy` puis `node index.js`. Donc **à chaque démarrage** (premier déploiement ou redémarrage), les migrations sont appliquées automatiquement sur la base Postgres. Pas besoin de lancer la commande à la main.
4. **Seed** (candidats + packs) : une seule fois après la première mise en place de la base, tu peux lancer le seed en local en pointant vers la base Railway (copie temporaire de `DATABASE_URL` depuis le service Postgres dans ton `.env`), puis `npx prisma db seed`. Ou ajouter un one-off sur Railway si tu préfères.

---

## 5. Où mettre la référence `${{...}}` (important)

- **Sur Railway** (dashboard du **service backend** → Variables) : ajoute `DATABASE_URL` avec la valeur `${{postgres-volume.DATABASE_PRIVATE_URL}}` (ou le nom de ton service Postgres). Railway **remplace** cette référence par la vraie URL au déploiement.
- **En local** (fichier `.env` du projet) : **ne mets pas** la référence `${{...}}` dans `.env`. En local elle n’est pas remplacée, et Prisma reçoit une chaîne invalide → erreur **P1013** (scheme not recognized). Mets une **vraie URL** PostgreSQL, par ex. `postgresql://postgres:motdepasse@localhost:5432/vote_iai`. Si le mot de passe contient `&` ou `@`, encode-les : `&` → `%26`, `@` → `%40`.

## 6. Résumé

- **Backend Railway** → Variables → `DATABASE_URL` = `${{NOM_SERVICE_POSTGRES.DATABASE_PRIVATE_URL}}`.
- **Local** → dans `.env`, une vraie URL (ex. `postgresql://user:password@localhost:5432/vote_iai`) pour `prisma migrate deploy` et le dev.
- Pas besoin de « monter » Postgres : la connexion se fait uniquement via cette URL.

---

## 7. Build Railway et DATABASE_URL

Lors du **build**, Railway exécute `npm ci` puis `postinstall` → `prisma generate`. À ce moment, la variable `DATABASE_URL` (ou la référence `${{...}}`) n’est parfois pas encore disponible. Pour que le build ne plante pas, `prisma.config.ts` utilise une **URL factice** si `DATABASE_URL` est absent (uniquement pour la génération du client, qui ne se connecte pas à la base). Au **runtime** (démarrage du service), `DATABASE_URL` est bien définie par Railway ; elle est utilisée pour `prisma migrate deploy` et l’application.

## 8. Prisma 7 (configuration)

Ce projet utilise **Prisma 7** avec :

- **prisma.config.ts** : l’URL de la base (`DATABASE_URL`) est définie dans `datasource.url` (plus dans le schema). Utilisée par la CLI pour `migrate deploy`, etc.
- **schema.prisma** : le bloc `datasource` n’a plus de `url` ; le provider est `prisma-client` avec `output = "../generated/prisma"`.
- **Client** : `db.js` et `prisma/seed.js` instancient `PrismaClient` avec l’adaptateur **@prisma/adapter-pg** en passant `process.env.DATABASE_URL`.

Commandes utiles (à la racine du backend, après `npm install`) :

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Si tu as une erreur SSL en production (ex. `rejectUnauthorized`), tu peux autoriser les certificats non vérifiés dans `db.js` :

```js
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
```
