# Connecter le backend Railway à PostgreSQL (Postgres / postgres-volume)

Quand tu as créé un **service PostgreSQL** (ou postgres-volume) à côté de ton backend sur Railway, il faut donner au backend l’URL de connexion. Voici comment.

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
3. Côté base : exécuter les migrations Prisma **une fois** sur la base Railway :
   - En local, avec la même URL (tu peux copier temporairement `DATABASE_URL` depuis le service Postgres → Variables pour l’utiliser en local).
   - Ou via un déploiement qui lance `prisma migrate deploy` (et éventuellement le seed) au build/start.

---

## 5. Résumé

- **Backend Railway** → Variables → `DATABASE_URL` = `${{NOM_SERVICE_POSTGRES.DATABASE_PRIVATE_URL}}`.
- **Local** → garde dans ton `.env` une vraie URL (ex. `postgresql://user:password@localhost:5432/vote_iai`) pour pgAdmin / dev.
- Pas besoin de créer une base à la main : Railway crée la base et fournit l’URL via ces variables.
