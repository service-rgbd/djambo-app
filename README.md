<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Djambo

Marketplace automobile premium avec frontend React/Vite et backend Express/PostgreSQL.

## Lancement local

Prérequis : Node.js 20+

1. Installer les dépendances
   `npm install`
2. Vérifier les variables d'environnement dans [/.env](.env) et [/.env.local](.env.local)
3. Appliquer les migrations
   `npm run db:migrate`
4. Lancer le backend local
   `npm run api`
5. Lancer le frontend Vite
   `npm run dev`

En local, le frontend pointe par defaut vers l API Render `https://api.djambo-app.com` via `VITE_API_BASE_URL` defini dans [/.env.local](.env.local).

Si vous voulez tester explicitement le backend local a la place, remplacez temporairement cette variable par `http://localhost:8787`.

## Variables d'environnement

Exemple minimal dans [/.env.example](.env.example) :

- `DATABASE_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `APP_URL`
- `API_URL`
- `ALLOWED_ORIGINS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `VITE_API_BASE_URL`

Variables optionnelles pour les uploads photo parking/vehicule via Cloudflare R2 :

- `UPLOAD_STORAGE_PROVIDER=r2`
- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_BASE_URL`
- `MAX_UPLOAD_SIZE_MB`

## Déploiement GitHub + Render

### 1. Préparer le dépôt GitHub

1. Créer un dépôt GitHub vide
2. Dans le projet local :
   `git init`
3. Ajouter le remote :
   `git remote add origin <URL_DU_REPO>`
4. Commit initial :
   `git add . && git commit -m "Initial deploy setup"`
5. Push :
   `git push -u origin main`

### 2. Déployer sur Render

Le fichier [render.yaml](render.yaml) prepare deux services :

1. `fleetcommand-api`
   service web Node/Express
2. `fleetcommand-web`
   site statique Vite

### 3. Services à créer dans Render

Backend Render :

1. Type : `Web Service`
2. Root directory : laisser vide
3. Build command : `npm ci`
4. Start command : `npm run start`
5. Health check path : `/api/health`
6. Custom domain : `api.djambo-app.com`

Frontend Render :

1. Type : `Static Site`
2. Build command : `npm ci && npm run build`
3. Publish directory : `dist`
4. Custom domain : `djambo-app.com`

### 4. Variables Render à définir sur le backend

1. `DATABASE_URL`
2. `RESEND_API_KEY`
3. `RESEND_FROM_EMAIL=noreply@djambo-app.com`
4. `APP_URL=https://djambo-app.com`
5. `API_URL=https://api.djambo-app.com`
6. `ALLOWED_ORIGINS=https://djambo-app.com,https://www.djambo-app.com`
7. `GOOGLE_CLIENT_ID`
8. `GOOGLE_CLIENT_SECRET`
9. `PORT` sera injecté automatiquement par Render

Pour activer plus tard les uploads de photos parking/vehicule depuis le backend Render, ajoutez aussi :

1. `UPLOAD_STORAGE_PROVIDER=r2`
2. `R2_ACCOUNT_ID=<cloudflare-account-id>`
3. `R2_BUCKET_NAME=djambo-app-uploads`
4. `R2_ACCESS_KEY_ID=<r2-access-key-id>`
5. `R2_SECRET_ACCESS_KEY=<r2-secret-access-key>`
6. `R2_PUBLIC_BASE_URL=https://media.djambo-app.com`
7. `MAX_UPLOAD_SIZE_MB=10`

### 5. Variables Render à définir sur le frontend

1. `VITE_API_BASE_URL=https://api.djambo-app.com`

## Notes de developpement local

- Si `RESEND_API_KEY` est absent en local, le backend ne bloque plus l inscription: le compte est active automatiquement en mode developpement.
- En production Render, `RESEND_API_KEY` reste obligatoire.

### 6. Google Auth à renseigner

Authorized JavaScript origins :

1. `https://djambo-app.com`
2. `http://localhost:3000`
3. `http://127.0.0.1:3000`

Authorized redirect URIs :

1. `https://api.djambo-app.com/api/auth/google/callback`
2. `http://localhost:8787/api/auth/google/callback`
3. `http://127.0.0.1:8787/api/auth/google/callback`
