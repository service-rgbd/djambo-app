<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FleetCommand

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

En local, le frontend appelle automatiquement `http://localhost:8787` via `VITE_API_BASE_URL` défini dans [/.env.local](.env.local).

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

Le fichier [render.yaml](render.yaml) prépare deux services :

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

### 5. Variables Render à définir sur le frontend

1. `VITE_API_BASE_URL=https://api.djambo-app.com`

### 6. Google Auth à renseigner

Authorized JavaScript origins :

1. `https://djambo-app.com`
2. `http://localhost:3000`
3. `http://127.0.0.1:3000`

Authorized redirect URIs :

1. `https://api.djambo-app.com/api/auth/google/callback`
2. `http://localhost:8787/api/auth/google/callback`
3. `http://127.0.0.1:8787/api/auth/google/callback`
