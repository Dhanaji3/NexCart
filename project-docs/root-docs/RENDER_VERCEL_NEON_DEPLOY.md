# Deploy on Render + Vercel + Neon

This guide covers every step from pushing code to GitHub through deploying:

- backend on Render
- frontend apps on Vercel
- database on Neon

It is written for this repository structure, where the backend lives in `backend/backend-springboot` and the frontend lives in `frontend/`.

## 1. Push the code to GitHub

1. Create a GitHub repository.
2. In the repo root (`d:\Projects\vue-micro-frontends-email`), run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

3. Confirm the repository contains:
   - `frontend/`
   - `backend/backend-springboot/`
   - `project-docs/`

> Use the `main` branch for deployment.

## 2. Create the Neon database

1. Sign in to Neon: `https://neon.tech`
2. Create a new project using the free tier.
3. Create a new branch or use the default branch.
4. Copy the connection information.

### 2.1 Build the JDBC URL

Render expects a JDBC-style Postgres URL. Use this format:

```text
jdbc:postgresql://<neon-host>:<port>/<database>?sslmode=require
```

Example:

```text
jdbc:postgresql://db.neon.tech:5432/mydb?sslmode=require
```

5. Save your Neon credentials:
   - host
   - port
   - database name
   - username
   - password

## 3. Deploy the backend on Render

### 3.1 Create a Render web service

1. Go to `https://render.com`
2. Create a new project and connect your GitHub repository.
3. Add a new **Web Service**.
4. Select branch `main`.
5. Set the root directory to:

```text
backend/backend-springboot
```

### 3.2 Configure build and start commands

- Build Command:

```bash
./gradlew build -x test
```

- Start Command:

```bash
java -jar build/libs/backend-springboot-1.0.0.jar
```

### 3.3 Set Render environment variables

Add the following environment variables in Render:

- `SPRING_PROFILES_ACTIVE=prod`
- `SPRING_DATASOURCE_URL=jdbc:postgresql://<neon-host>:5432/<database>?sslmode=require`
- `SPRING_DATASOURCE_USERNAME=<username>`
- `SPRING_DATASOURCE_PASSWORD=<password>`
- `JWT_SECRET=<strong-secret-32-characters-or-more>`
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver`

### 3.4 Configure CORS for Vercel

The backend must allow browser requests from your Vercel domains.

If your Vercel URLs are not ready yet, temporarily allow all origins in Render env vars:

- `SPRING_WEB_CORS_ALLOWED_ORIGINS=*`

Later you should restrict:

- `SPRING_WEB_CORS_ALLOWED_ORIGINS=https://<host>.vercel.app,https://<mfe-auth>.vercel.app,https://<mfe-products>.vercel.app,https://<mfe-cart>.vercel.app,https://<mfe-checkout>.vercel.app,https://<mfe-orders>.vercel.app,https://<mfe-admin>.vercel.app`

### 3.5 Deploy and verify

1. Deploy the Render service.
2. Once it succeeds, note the service URL, for example:

```text
https://vue-mfe-backend.onrender.com
```

3. Verify the backend is up:

```bash
curl https://<your-render-service>/api/health
```

If the project does not offer `/api/health`, try another backend endpoint.

## 4. Deploy Frontend apps on Vercel

The frontend is a monorepo with workspaces under `frontend/`.
Each MFE is deployed as a separate static Vercel project.

### 4.1 Common settings for all Vercel apps

- Framework Preset: `Other`
- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build --workspace=<workspace-name>`
- Output Directory: `<workspace-name>/dist`
- Environment Variable: `VITE_API_URL=https://<your-render-service>`

### 4.2 Deploy each micro frontend

Create one Vercel project for each workspace:

1. `mfe-auth`
2. `mfe-products`
3. `mfe-cart`
4. `mfe-checkout`
5. `mfe-orders`
6. `mfe-admin`

For each project:

- Root Directory: `frontend`
- Build Command: `npm run build --workspace=<workspace-name>`
- Output Directory: `<workspace-name>/dist`
- Env Var: `VITE_API_URL=https://<your-render-service>`

Example for `mfe-auth`:

- Build Command: `npm run build --workspace=mfe-auth`
- Output Directory: `mfe-auth/dist`

Repeat for the other MFEs.

### 4.3 Deploy the host shell last

Create one more Vercel project for `host`:

- Root Directory: `frontend`
- Build Command: `npm run build --workspace=host`
- Output Directory: `host/dist`

Set these environment variables:

- `VITE_API_URL=https://<your-render-service>`
- `VITE_MFE_AUTH_URL=https://<mfe-auth>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_PRODUCTS_URL=https://<mfe-products>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_CART_URL=https://<mfe-cart>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_CHECKOUT_URL=https://<mfe-checkout>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_ORDERS_URL=https://<mfe-orders>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_ADMIN_URL=https://<mfe-admin>.vercel.app/assets/remoteEntry.js`

> Build and deploy the host after all MFEs are deployed.

### 4.4 Verify each static site

Open each Vercel app URL in the browser and confirm it loads:

- `https://<mfe-auth>.vercel.app`
- `https://<mfe-products>.vercel.app`
- `https://<mfe-cart>.vercel.app`
- `https://<mfe-checkout>.vercel.app`
- `https://<mfe-orders>.vercel.app`
- `https://<mfe-admin>.vercel.app`

Then open the host app:

- `https://<host>.vercel.app`

If the host fails to show remote components, re-check the `VITE_MFE_*_URL` values.

## 5. Deployment order summary

1. Push code to GitHub.
2. Deploy Neon database.
3. Deploy backend on Render.
4. Deploy the 6 MFE apps on Vercel.
5. Deploy the host on Vercel.
6. Validate the full application.

## 6. Render environment variables checklist

- `SPRING_PROFILES_ACTIVE=prod`
- `SPRING_DATASOURCE_URL=jdbc:postgresql://<neon-host>:5432/<database>?sslmode=require`
- `SPRING_DATASOURCE_USERNAME=<username>`
- `SPRING_DATASOURCE_PASSWORD=<password>`
- `JWT_SECRET=<strong-secret-32+chars>`
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver`
- `SPRING_WEB_CORS_ALLOWED_ORIGINS=https://<host>.vercel.app,https://<mfe-auth>.vercel.app,https://<mfe-products>.vercel.app,https://<mfe-cart>.vercel.app,https://<mfe-checkout>.vercel.app,https://<mfe-orders>.vercel.app,https://<mfe-admin>.vercel.app`

## 7. Vercel environment variables checklist

### All MFEs:

- `VITE_API_URL=https://<your-render-service>`

### Host:

- `VITE_API_URL=https://<your-render-service>`
- `VITE_MFE_AUTH_URL=https://<mfe-auth>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_PRODUCTS_URL=https://<mfe-products>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_CART_URL=https://<mfe-cart>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_CHECKOUT_URL=https://<mfe-checkout>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_ORDERS_URL=https://<mfe-orders>.vercel.app/assets/remoteEntry.js`
- `VITE_MFE_ADMIN_URL=https://<mfe-admin>.vercel.app/assets/remoteEntry.js`

If you want, I can also give you the exact Vercel project settings for each app and the exact Render env var list in one compact checklist.

## 8. Compact checklist: Vercel projects + Render env vars

### Render backend env vars

- `SPRING_PROFILES_ACTIVE=prod`
- `SPRING_DATASOURCE_URL=jdbc:postgresql://<neon-host>:5432/<database>?sslmode=require`
- `SPRING_DATASOURCE_USERNAME=<username>`
- `SPRING_DATASOURCE_PASSWORD=<password>`
- `JWT_SECRET=<strong-secret-32+chars>`
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver`
- `SPRING_WEB_CORS_ALLOWED_ORIGINS=https://<host>.vercel.app,https://<mfe-auth>.vercel.app,https://<mfe-products>.vercel.app,https://<mfe-cart>.vercel.app,https://<mfe-checkout>.vercel.app,https://<mfe-orders>.vercel.app,https://<mfe-admin>.vercel.app>`

### Vercel project settings for each app

Use these common settings for every Vercel project:

- Root Directory: `frontend`
- Install Command: `npm install`
- Framework Preset: `Other`

#### `mfe-auth`

- Build Command: `npm run build --workspace=mfe-auth`
- Output Directory: `mfe-auth/dist`
- Env: `VITE_API_URL=https://<your-render-service>`

#### `mfe-products`

- Build Command: `npm run build --workspace=mfe-products`
- Output Directory: `mfe-products/dist`
- Env: `VITE_API_URL=https://<your-render-service>`

#### `mfe-cart`

- Build Command: `npm run build --workspace=mfe-cart`
- Output Directory: `mfe-cart/dist`
- Env: `VITE_API_URL=https://<your-render-service>`

#### `mfe-checkout`

- Build Command: `npm run build --workspace=mfe-checkout`
- Output Directory: `mfe-checkout/dist`
- Env: `VITE_API_URL=https://<your-render-service>`

#### `mfe-orders`

- Build Command: `npm run build --workspace=mfe-orders`
- Output Directory: `mfe-orders/dist`
- Env: `VITE_API_URL=https://<your-render-service>`

#### `mfe-admin`

- Build Command: `npm run build --workspace=mfe-admin`
- Output Directory: `mfe-admin/dist`
- Env: `VITE_API_URL=https://<your-render-service>`

#### `host`

- Build Command: `npm run build --workspace=host`
- Output Directory: `host/dist`
- Env:
  - `VITE_API_URL=https://<your-render-service>`
  - `VITE_MFE_AUTH_URL=https://<mfe-auth>.vercel.app/assets/remoteEntry.js`
  - `VITE_MFE_PRODUCTS_URL=https://<mfe-products>.vercel.app/assets/remoteEntry.js`
  - `VITE_MFE_CART_URL=https://<mfe-cart>.vercel.app/assets/remoteEntry.js`
  - `VITE_MFE_CHECKOUT_URL=https://<mfe-checkout>.vercel.app/assets/remoteEntry.js`
  - `VITE_MFE_ORDERS_URL=https://<mfe-orders>.vercel.app/assets/remoteEntry.js`
  - `VITE_MFE_ADMIN_URL=https://<mfe-admin>.vercel.app/assets/remoteEntry.js`

## 9. Troubleshooting

- If the host is blank or remote modules fail, verify each `remoteEntry.js` URL is reachable.
- If login or API calls fail, verify `VITE_API_URL` and the backend CORS settings.
- If Render deployment fails, check the build logs for Gradle errors and missing Java dependencies.
- If Vercel build fails, ensure the workspace root is `frontend` and the build command is `npm run build --workspace=<workspace-name>`.

## 10. Notes

- This setup is intended for demo and proof-of-concept deployment.
- Free tiers may sleep after inactivity.
- For production-ready deployment, use the AWS guide instead.
