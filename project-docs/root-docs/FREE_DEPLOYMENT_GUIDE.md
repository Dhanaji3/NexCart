# Free Deployment Guide

This guide explains how to deploy the project using free-tier platforms such as Vercel, Netlify, Railway, Render, or Cloudflare Pages. The goal is to run the frontend microsites as free static deployments and the backend as a free service with a free Postgres database.

> Note: This project uses a micro frontend architecture. In practice, this means each app (`host`, `mfe-auth`, `mfe-products`, `mfe-cart`, `mfe-checkout`, `mfe-orders`, `mfe-admin`) is deployed as a separate static site, and the backend is deployed as a separate service.

## Supported free deployment mix

- Frontend: Vercel / Netlify / Cloudflare Pages (static sites)
- Backend: Railway / Render / Fly.io (free service for Spring Boot)
- Database: Railway Postgres / Supabase free tier

## 1) Backend deployment

### Option A: Deploy backend on Railway

1. Create a Railway account and a new project.
2. Add a new service and choose `Java` or `Docker`.
3. Point the service to `backend/backend-springboot`.
4. Use the existing `Dockerfile` or Railway’s Java build support.
5. Set these environment variables in Railway:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `JAVA_OPTS=-Xmx512m -Xms256m`
   - `SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<db>`
   - `SPRING_DATASOURCE_USERNAME=<username>`
   - `SPRING_DATASOURCE_PASSWORD=<password>`
   - `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`
   - `JWT_SECRET=<random-secret>`
   - `JWT_EXPIRATION_MS=3600000`

6. Deploy and copy the service URL, for example:

   `https://vue-mfe-backend.up.railway.app`

### Option B: Deploy backend on Render

1. Create a Render account.
2. Create a new `Web Service` from GitHub.
3. Choose the `backend/backend-springboot` folder.
4. Set `Build Command` to:

   ```bash
   ./gradlew build -x test
   ```

5. Set `Start Command` to:

   ```bash
   java -jar build/libs/backend-springboot-1.0.0.jar
   ```

6. Configure environment variables as shown above.
7. Deploy and copy the service URL.

### Option C: Use Supabase for the database

If you choose Supabase, create a free project and copy the Postgres credentials to your backend’s env settings.

## 2) Frontend deployment

### Build and publish each app individually

The frontend uses separate workspaces. Each app must be deployed as its own static site.

#### 2.1 Deploy `host`

- Root folder: `frontend/host`
- Build command:

  ```bash
  npm install
  npm run build
  ```

- Publish directory: `dist`

- Set env variables for the host build:
  - `VITE_API_URL=https://<backend-url>`
  - `VITE_MFE_AUTH_URL=https://<mfe-auth-url>/assets/remoteEntry.js`
  - `VITE_MFE_PRODUCTS_URL=https://<mfe-products-url>/assets/remoteEntry.js`
  - `VITE_MFE_CART_URL=https://<mfe-cart-url>/assets/remoteEntry.js`
  - `VITE_MFE_CHECKOUT_URL=https://<mfe-checkout-url>/assets/remoteEntry.js`
  - `VITE_MFE_ORDERS_URL=https://<mfe-orders-url>/assets/remoteEntry.js`
  - `VITE_MFE_ADMIN_URL=https://<mfe-admin-url>/assets/remoteEntry.js`

> The host must be built after all remote MFEs are deployed.

#### 2.2 Deploy the MFEs

For each micro frontend, use its folder as a separate static deployment:

- `frontend/mfe-auth`
- `frontend/mfe-products`
- `frontend/mfe-cart`
- `frontend/mfe-checkout`
- `frontend/mfe-orders`
- `frontend/mfe-admin`

Build command for each:

```bash
npm install
npm run build
```

Publish directory: `dist`

Each MFE usually uses the backend API URL from `VITE_API_URL`. Set that same backend URL as an env variable in each static host project.

### 2.3 Recommended free static hosts

- **Vercel**: create one project per workspace and point to the folder.
- **Netlify**: one site per workspace; set base directory to each workspace folder.
- **Cloudflare Pages**: one project per workspace; set build command and output dir.

### Example deploy settings for Vercel

For `frontend/mfe-auth`:

- Root Directory: `frontend/mfe-auth`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`
- Env vars: `VITE_API_URL=https://<backend-url>`

Repeat the same pattern for other MFEs and for `frontend/host`.

## 3) Recommended free platform combination

This repository is easiest to deploy using a mix of free services:

- Backend service: Railway or Render
- Database: Railway Postgres or Supabase free tier
- Static frontends: Vercel / Netlify / Cloudflare Pages

## 4) Important details

- The host app uses runtime remote URLs from env variables, so `host` must point to the live remote entry paths.
- After deploying the remote MFEs, update the host project env variables and redeploy `host`.
- The backend must be reachable from all frontend apps and the browser.
- Free tiers sleep after inactivity and are best for demos, not production.

## 5) Minimal free deployment path

If you need the fastest path with the fewest apps:

1. Deploy backend on Railway/Render.
2. Deploy the 7 frontends as independent static sites.
3. Set `VITE_API_URL` in every frontend to the backend URL.
4. Set `VITE_MFE_*_URL` in `host` to the deployed remote entries.
5. Deploy `host` last.

## 6) If you want a simpler demo instead of multiple apps

You can also use this repo as a single static demo by building the host and one MFE together, but the full micro frontend behavior requires each `remoteEntry.js` to stay available from its own URL.

---

## Notes

- This is a free-tier deployment guide for demo/demo-proof-of-concept use.
- For true production, use the `AWS_PRODUCTION_DEPLOY.md` guide.
