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
- `OPEN_AI_CHAT_BOT`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `AI_CACHE_TTL_MS`
- `WEB_PUSH_PUBLIC_KEY`
- `WEB_PUSH_PRIVATE_KEY`
- `WEB_PUSH_SUBJECT`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_SITE_KEY`
- `VITE_TURNSTILE_SITE_KEY`

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
9. `OPEN_AI_CHAT_BOT`
10. `OPENROUTER_MODEL=google/gemini-2.0-flash-001`
11. `AI_CACHE_TTL_MS=21600000`
12. `WEB_PUSH_PUBLIC_KEY`
13. `WEB_PUSH_PRIVATE_KEY`
14. `WEB_PUSH_SUBJECT=mailto:support@djambo-app.com`
15. `TURNSTILE_SECRET_KEY=<cloudflare-turnstile-secret-key>`
16. `TURNSTILE_SITE_KEY=<cloudflare-turnstile-site-key>`
17. `PORT` sera injecté automatiquement par Render

Le chatbot FleetMind passe par le backend et n expose plus de cle IA au frontend. La variable privilegiee cote Render peut etre `OPEN_AI_CHAT_BOT`; `OPENROUTER_API_KEY` reste acceptee comme alias.

Strategie anti-gaspillage integree :

1. Les salutations et questions frequentes sont traitees localement sans appel modele.
2. Les demandes recentes identiques sont reservees via un cache court cote API.
3. Le contexte envoye au modele est compact pour limiter les tokens.
4. Les reponses sont volontairement courtes pour reduire le cout par interaction.

Notifications push web :

1. Les notifications internes persistantes restent stockees en base dans `app_notifications`.
2. Les notifications push web se branchent au-dessus via des abonnements navigateur lies a la session utilisateur.
3. Les evenements couverts incluent les demandes vehicule, les reponses vendeur/client, les contrats et les premieres visites de profil proprietaire.
4. Pour activer le push en production, il faut definir les cles VAPID `WEB_PUSH_PUBLIC_KEY` et `WEB_PUSH_PRIVATE_KEY` cote backend Render.

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
2. `VITE_TURNSTILE_SITE_KEY=<cloudflare-turnstile-site-key>`

Cloudflare Turnstile pour login et inscription :

1. Creez un widget Turnstile dans Cloudflare pour le domaine `djambo-app.com`.
2. Recuperez la `site key` publique et la `secret key` privee.
3. Cote backend Render, utilisez `TURNSTILE_SECRET_KEY` et `TURNSTILE_SITE_KEY`.
4. Le frontend Cloudflare lit maintenant la `site key` a l execution via l API backend, ce qui evite de dependre d une build locale avec la cle embarquee.
5. `VITE_TURNSTILE_SITE_KEY` reste utile pour une static site Render ou pour des builds frontend hors runtime API.
6. Les routes protegees en place ici sont `POST /api/auth/login` et `POST /api/auth/register`.
7. Sans `TURNSTILE_SECRET_KEY`, la verification reste desactivee en local pour ne pas bloquer le developpement.

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
