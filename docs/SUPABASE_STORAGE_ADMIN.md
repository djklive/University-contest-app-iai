# Supabase Storage – Admin (images / vidéos candidats)

Pour que l’admin puisse envoyer des images et vidéos sur Supabase Storage depuis le front-admin, il faut créer un bucket et une politique d’accès.

## 1. Créer le bucket dans Supabase

1. Va sur [supabase.com](https://supabase.com) → ton projet → **Storage** dans le menu.
2. Clique sur **New bucket**.
3. **Name** : `candidates` (ou un autre nom, à reprendre dans le code).
4. **Public bucket** : coche **Public** pour que les URLs des fichiers soient accessibles sans auth (affichage sur le site public).
5. Valide.

## 2. Politique d’accès (RLS) pour les uploads

Par défaut, les uploads sont refusés. Il faut autoriser les insertions.

1. Dans **Storage** → bucket **candidates** → onglet **Policies** (ou **Configuration**).
2. **New policy** → "For full customization" (ou équivalent).
3. Ajoute une politique **INSERT** pour permettre les uploads :

- **Policy name** : `Allow public uploads` (ou un nom explicite).
- **Allowed operation** : `INSERT`.
- **Target roles** : `anon` (pour que le front-admin avec la clé anon/publishable puisse uploader).
- **WITH CHECK** : par exemple `true` pour tout le bucket, ou une condition sur le chemin (ex. `bucket_id = 'candidates'`).

Exemple en SQL (si tu préfères l’éditeur SQL) :

```sql
-- Permettre à tout le monde (anon) d’uploader dans le bucket candidates
CREATE POLICY "Allow public uploads to candidates"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'candidates');
```

4. Ajoute une politique **SELECT** pour que les fichiers soient lisibles (public) :

```sql
CREATE POLICY "Allow public read candidates"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'candidates');
```

5. Sauvegarde.

## 3. Variables d’environnement (front-admin)

Dans le projet **front-admin** (ou frontend-admin), ajoute dans `.env` :

- `VITE_SUPABASE_URL` = ton URL Supabase (ex. `https://rnzvssyqoqarhutpkwva.supabase.co`).
- `VITE_SUPABASE_ANON_KEY` = ta clé **anon** (ou la clé "publishable" fournie par Supabase : **Project Settings → API → Project API keys → anon public**).

La clé `sb_publishable_...` que tu as peut être la clé anon ; si les uploads échouent avec une erreur 403, vérifie dans Supabase **Settings → API** que tu utilises bien l’**anon public** key.

## 4. Nom du bucket dans le code

Dans le code du front-admin, le bucket utilisé est `candidates`. Si tu as choisi un autre nom dans l’étape 1, il faut le mettre à jour dans le fichier qui fait l’upload (ex. `lib/supabase.ts` ou le composant AdminCandidates).

## 5. Résumé

1. Créer un bucket **Public** nommé `candidates`.
2. Ajouter une policy **INSERT** pour `anon` (ou `public`) sur `storage.objects` pour `bucket_id = 'candidates'`.
3. Ajouter une policy **SELECT** pour que les fichiers soient lisibles.
4. Configurer `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans le front-admin.

Après ça, l’admin peut envoyer des images/vidéos et récupérer des URLs du type :  
`https://rnzvssyqoqarhutpkwva.supabase.co/storage/v1/object/public/candidates/xxx.jpg`.
