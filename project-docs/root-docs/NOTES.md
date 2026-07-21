# Vue 3 Micro-Frontends E-Commerce Platform - Step by Step Guide

## Recent implementation notes

- Cart quantity updates now work with the frontend payload contract.
- Admin product updates now save stock values correctly.
- Order listing and status updates now follow the customer/admin route split implemented in the backend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOST (Port 5000)                         │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  App Shell│  │  Router  │  │  Pinia   │  │  Shared UI   │  │
│  │  (Nav/    │  │  (Lazy   │  │  (Cart & │  │  (Loading/   │  │
│  │   Footer) │  │   Load)  │  │   Auth)  │  │   Errors)    │  │
│  └───────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│                                                                 │
│  ┌─────────────────── Module Federation ───────────────────┐   │
│  │  Consumes remote components from MFE services           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
        │          │          │          │          │          │
        ▼          ▼          ▼          ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │MFE-Auth│ │MFE-Prod│ │MFE-Cart│ │MFE-Chk │ │MFE-Ord │ │MFE-Adm │
   │  :5001 │ │  :5002 │ │  :5003 │ │  :5004 │ │  :5005 │ │  :5006 │
   │        │ │        │ │        │ │        │ │        │ │        │
   │ Login  │ │Product │ │ Cart   │ │Checkout│ │ Order  │ │ Admin  │
   │Register│ │  List  │ │Wishlist│ │Payment │ │  List  │ │Dashboard│
   │Profile │ │ Detail │ │        │ │        │ │ Detail │ │Products│
   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │ Orders │
                                                            └────────┘
```

---

## Step 1: Project Structure Setup (Monorepo with npm Workspaces)

### What we created:

```
vue-micro-frontends/
├── package.json              ← Root workspace config
├── .env                      ← Shared env (VITE_API_URL) for all MFEs
├── tailwind.config.mjs       ← Root Tailwind config (shared preset, scans all MFEs)
├── postcss.config.mjs        ← Root PostCSS config (@tailwindcss/postcss)
├── api-server/               ← REST API (Express.js + JWT)
│   └── server.js
├── shared/                   ← Shared library (types, stores, composables, utils)
│   ├── tailwind.preset.js    ← Shared Tailwind design tokens
│   ├── src/
│   │   ├── index.ts
│   │   ├── types.ts          ← 30+ TypeScript interfaces
│   │   ├── api.ts            ← Internal API (auth, cart, wishlist) using axios
│   │   ├── composables/      ← 5 Vue composition hooks
│   │   ├── utils/            ← 6 utility modules
│   │   ├── stores/           ← 5 Pinia stores
│   │   │   ├── auth.ts
│   │   │   ├── cart.ts
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   └── notification.ts
│   │   └── data/products.ts
│   └── __tests__/            ← 11 test files (113+ tests)
├── host/                     ← Shell application (consumer)
│   ├── .env.development      ← localhost MFE URLs
│   ├── .env.production       ← production MFE URLs
│   ├── src/
│   │   ├── main.ts          ← Async boundary entry
│   │   ├── bootstrap.ts     ← Actual app initialization
│   │   ├── assets/
│   │   │   └── tailwind.css  ← Tailwind entry + component classes
│   │   ├── composables/
│   │   │   ├── http.ts       ← Configured axios instance
│   │   │   └── useHomeApi.ts ← Home page data
│   │   ├── App.vue
│   │   ├── router/index.ts
│   │   └── views/
│   └── vite.config.ts
├── mfe-auth/                 ← Auth micro-frontend (provider)
│   └── src/assets/tailwind.css
├── mfe-products/             ← Products micro-frontend (provider)
│   └── src/
│       ├── assets/tailwind.css
│       └── composables/ (http.ts, useProductsApi.ts, useCategoriesApi.ts)
├── mfe-cart/                 ← Cart micro-frontend (provider)
│   └── src/assets/tailwind.css
├── mfe-checkout/             ← Checkout micro-frontend (provider)
│   └── src/
│       ├── assets/tailwind.css
│       └── composables/ (http.ts, useCheckoutApi.ts)
├── mfe-orders/               ← Orders micro-frontend (provider)
│   └── src/
│       ├── assets/tailwind.css
│       └── composables/ (http.ts, useOrdersApi.ts)
└── mfe-admin/                ← Admin micro-frontend (provider)
    └── src/
        ├── assets/tailwind.css
        └── composables/ (http.ts, useAdminProductsApi.ts, useAdminOrdersApi.ts, useAdminStatsApi.ts)
```

### Root `package.json` (npm workspaces):

```json
{
  "name": "vue-micro-frontends",
  "private": true,
  "workspaces": [
    "shared",
    "host",
    "mfe-auth",
    "mfe-products",
    "mfe-cart",
    "mfe-checkout",
    "mfe-orders",
    "mfe-admin",
    "api-server"
  ]
}
```

### Flow - Workspace Dependency Resolution:

```
┌──────────────────────────────────────────────────────────┐
│                   npm install (root)                      │
│                                                          │
│  Resolves all workspace dependencies:                    │
│                                                          │
│  host ──────────────► shared (workspace:*)               │
│  mfe-auth ──────────► shared (workspace:*)               │
│  mfe-products ──────► shared (workspace:*)               │
│  mfe-cart ──────────► shared (workspace:*)               │
│  mfe-checkout ──────► shared (workspace:*)               │
│  mfe-orders ────────► shared (workspace:*)               │
│  mfe-admin ─────────► shared (workspace:*)               │
│                                                          │
│  All share: vue, vue-router, pinia, typescript, vite     │
└──────────────────────────────────────────────────────────┘
```

---

## Step 2: Shared Library

### Purpose:

Central package containing types, Pinia stores, composables, utilities, HTTP client, and API services shared across all micro-frontends.

```
shared/src/
├── index.ts          ← Barrel export (all modules)
├── types.ts          ← 30+ TypeScript interfaces (Product, User, Order, etc.)
├── http.ts           ← Typed HTTP client with auth token injection
├── api.ts            ← REST API service layer (authApi, productsApi, etc.)
├── composables/      ← Vue 3 Composition API hooks
│   ├── useApi.ts     ← Generic API wrapper { data, loading, error, execute }
│   ├── useProducts.ts← Products with search/filter/sort/pagination
│   ├── useOrders.ts  ← Orders CRUD composable
│   ├── useCart.ts    ← Cart with formatted totals & shipping
│   ├── useDebounce.ts← Reactive debounced ref
│   ├── useNotification.ts ← Toast notification helper
│   └── usePagination.ts   ← Pagination state management
├── utils/            ← Reusable utility functions
│   ├── currency.ts   ← formatCurrency, calculateTax, calculateDiscount
│   ├── date.ts       ← formatDate, formatRelativeTime, isToday
│   ├── validators.ts ← Email, password, phone, zip, address validation
│   ├── storage.ts    ← Type-safe localStorage/sessionStorage wrapper
│   ├── debounce.ts   ← debounce() & throttle() functions
│   └── string.ts     ← truncate, slugify, capitalize, pluralize
├── stores/
│   ├── auth.ts       ← Authentication (login, register, profile, JWT)
│   ├── cart.ts       ← Shopping cart & wishlist (API-synced)
│   ├── products.ts   ← Products CRUD with filters & pagination
│   ├── orders.ts     ← Order management with status tracking
│   └── notification.ts ← Toast notifications (auto-dismiss)
└── data/
    └── products.ts   ← Mock product catalog & categories
```

### Key Exports:

```typescript
// Types: Product, User, Order, Category, CartItem, Address, PaginatedResponse, etc.
// Stores: useAuthStore(), useCartStore(), useProductsStore(), useOrdersStore(), useNotificationStore()
// Composables: useApi(), useProducts(), useOrders(), useCart(), useDebounce(), useNotification(), usePagination()
// Utils: formatCurrency(), formatDate(), validateEmail(), debounce(), slugify(), storage.get/set
// API: authApi, productsApi, cartApi, ordersApi, adminApi
// HTTP: httpClient (typed client with JWT injection)
// Data: products[], categories[]
```

---

## Step 3: Host Application (Shell)

### Flow - How Host Loads Remote Components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser loads Host                         │
│                                                              │
│  1. index.html loads index.js (tiny entry)                   │
│                     │                                        │
│  2. index.js does: import('./bootstrap.js')                  │
│                     │  ← ASYNC BOUNDARY                      │
│                     ▼                                        │
│  3. bootstrap.js initializes:                                │
│     ├── createPinia()     ← Shared Pinia instance            │
│     ├── createRouter()    ← Routes with lazy federation      │
│     └── app.mount('#app') ← Renders App.vue shell            │
│                     │                                        │
│  4. User navigates to /login                                 │
│                     │                                        │
│  5. Router triggers: import('mfeAuth/Login')                 │
│                     │                                        │
│  6. Federation fetches remoteEntry.js from :5001             │
│                     │                                        │
│  7. Remote component uses SHARED Pinia/Vue instances         │
│                     │                                        │
│  8. Component renders inside host's <RouterView>             │
└─────────────────────────────────────────────────────────────┘
```

### Why Async Boundary is Required:

```
WITHOUT async boundary (BROKEN - blank page):
┌──────────────────────────────────────────────┐
│  index.js                                    │
│  ┌────────────────────────────────────────┐  │
│  │ const {createApp} = await resolve(vue) │  │ ← TOP-LEVEL AWAIT
│  │ const {createPinia} = await resolve()  │  │ ← Blocks entire module
│  │ // ... app init never completes        │  │ ← Page stays blank
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘

WITH async boundary (WORKS):
┌──────────────────────────────────────────────┐
│  index.js (no await - loads instantly)       │
│  ┌────────────────────────────────────────┐  │
│  │ import('./bootstrap.js')               │  │ ← Dynamic import
│  └────────────────────────────────────────┘  │
│                    │                         │
│                    ▼                         │
│  bootstrap.js (can have top-level await)     │
│  ┌────────────────────────────────────────┐  │
│  │ const {createApp} = await resolve(vue) │  │ ← OK in dynamic import
│  │ app.use(createPinia())                 │  │
│  │ app.mount('#app')                      │  │ ← App renders!
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Host `vite.config.ts` - Federation Consumer:

```typescript
federation({
  name: "host",
  remotes: {
    mfeAuth: "http://localhost:5001/assets/remoteEntry.js",
    mfeProducts: "http://localhost:5002/assets/remoteEntry.js",
    // ... other remotes
  },
  shared: ["vue", "vue-router", "pinia"], // CRITICAL for shared instances
});
```

---

## Step 4: Micro-Frontend Remotes (Providers)

### Each MFE follows this pattern:

```
mfe-auth/
├── src/
│   ├── App.vue           ← Standalone root (for isolated dev)
│   ├── main.ts           ← Standalone entry
│   └── components/
│       ├── Login.vue     ← EXPOSED to host
│       ├── Register.vue  ← EXPOSED to host
│       └── Profile.vue   ← EXPOSED to host
├── vite.config.ts        ← Federation provider config
└── package.json
```

### MFE `vite.config.ts` - Federation Provider:

```typescript
federation({
  name: "mfe-auth",
  filename: "remoteEntry.js",
  exposes: {
    "./Login": "./src/components/Login.vue",
    "./Register": "./src/components/Register.vue",
    "./Profile": "./src/components/Profile.vue",
  },
  shared: ["vue", "vue-router", "pinia"],
});
```

### Flow - Module Federation Shared Resolution:

```
┌─────────────────────────────────────────────────────────────────┐
│              Module Federation Shared Scope                       │
│                                                                   │
│  Host initializes shared scope:                                   │
│  ┌─────────────────────────────────────────────────┐             │
│  │  globalThis.__federation_shared__ = {            │             │
│  │    vue: { '3.4.0': hostVueInstance },            │             │
│  │    pinia: { '2.1.7': hostPiniaInstance },        │             │
│  │    'vue-router': { '4.3.0': hostRouterInstance } │             │
│  │  }                                              │             │
│  └─────────────────────────────────────────────────┘             │
│                          │                                        │
│                          ▼                                        │
│  Remote loads and checks shared scope:                            │
│  ┌─────────────────────────────────────────────────┐             │
│  │  "I need pinia ^2.1.0"                          │             │
│  │  → Found 2.1.7 in shared scope ✓               │             │
│  │  → Uses HOST's Pinia instance                   │             │
│  │  → useAuthStore() works with host's store!      │             │
│  └─────────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step 5: Routing (Host Router with Lazy Federation)

```typescript
// host/src/router/index.ts
const routes = [
  { path: "/", component: HomeView }, // Local
  { path: "/login", component: loadRemote(() => import("mfeAuth/Login")) },
  {
    path: "/products",
    component: loadRemote(() => import("mfeProducts/ProductList")),
  },
  { path: "/cart", component: loadRemote(() => import("mfeCart/Cart")) },
  // ...
];

// Error boundary wrapper
function loadRemote(loader: () => Promise<any>) {
  return () => loader().catch(() => import("../views/RemoteError.vue"));
}
```

### Route Navigation Flow:

```
User clicks "Products"
        │
        ▼
┌─────────────────────┐
│  Router beforeEach   │
│  - Check auth guards │
│  - Check admin role  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────┐
│  loadRemote(() =>           │
│    import('mfeProducts/...'))│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐     ┌────────────────────────┐
│  Federation resolves:       │────►│  Fetch remoteEntry.js  │
│  mfeProducts → :5002        │     │  from localhost:5002   │
└────────┬────────────────────┘     └────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Component renders in       │
│  host's <RouterView>        │
│  using shared Pinia/Vue     │
└─────────────────────────────┘
```

---

## Step 6: State Management (Pinia Shared Stores)

```
┌──────────────────────────────────────────────────────────┐
│                    Shared Pinia Stores                     │
│                                                          │
│  ┌─────────────────┐      ┌─────────────────┐          │
│  │   Auth Store     │      │   Cart Store     │          │
│  │                  │      │                  │          │
│  │ • user           │      │ • items[]        │          │
│  │ • token          │      │ • totalItems     │          │
│  │ • isAuthenticated│      │ • totalPrice     │          │
│  │ • isAdmin        │      │ • addItem()      │          │
│  │ • login()        │      │ • removeItem()   │          │
│  │ • register()     │      │ • clearCart()    │          │
│  │ • logout()       │      │                  │          │
│  └────────┬─────────┘      └────────┬─────────┘          │
│           │                          │                    │
│           ▼                          ▼                    │
│  ┌──────────────────────────────────────────────┐        │
│  │      SAME instance across all MFEs            │        │
│  │      (via Module Federation shared scope)     │        │
│  └──────────────────────────────────────────────┘        │
│           │                          │                    │
│     ┌─────┼──────┬──────────────┬────┼─────┐            │
│     ▼     ▼      ▼              ▼    ▼     ▼            │
│   Host  Auth  Products        Cart Checkout Orders       │
└──────────────────────────────────────────────────────────┘
```

---

## Step 7: Build & Dev Workflow

### Development Flow:

```
┌─────────────────────────────────────────────────────────┐
│                   Development Workflow                    │
│                                                          │
│  Step 1: Build all remotes                               │
│  ┌─────────────────────────────────────────────┐        │
│  │  npm run build --workspace=mfe-auth          │        │
│  │  npm run build --workspace=mfe-products      │        │
│  │  npm run build --workspace=mfe-cart          │        │
│  │  npm run build --workspace=mfe-checkout      │        │
│  │  npm run build --workspace=mfe-orders        │        │
│  │  npm run build --workspace=mfe-admin         │        │
│  └─────────────────────────────────────────────┘        │
│                       │                                  │
│                       ▼                                  │
│  Step 2: Build host with development mode                │
│  ┌─────────────────────────────────────────────┐        │
│  │  cd host && vite build --mode development    │        │
│  │  (loads .env.development → localhost URLs)   │        │
│  └─────────────────────────────────────────────┘        │
│                       │                                  │
│                       ▼                                  │
│  Step 3: Serve all via vite preview                      │
│  ┌─────────────────────────────────────────────┐        │
│  │  concurrently                                │        │
│  │    "vite preview --port 5001" (mfe-auth)     │        │
│  │    "vite preview --port 5002" (mfe-products) │        │
│  │    "vite preview --port 5003" (mfe-cart)     │        │
│  │    "vite preview --port 5004" (mfe-checkout) │        │
│  │    "vite preview --port 5005" (mfe-orders)   │        │
│  │    "vite preview --port 5006" (mfe-admin)    │        │
│  │    "vite preview --port 5000" (host)         │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Why `vite build` + `vite preview` (NOT `vite dev`)?

```
┌──────────────────────────────────────────────────────────┐
│  ❌ vite dev (DOES NOT WORK with Module Federation)       │
│                                                          │
│  vite dev serves raw ESM source files on-demand.         │
│  Module Federation needs a compiled remoteEntry.js        │
│  bundle with proper export manifests.                     │
│  Dev server doesn't generate this → federation fails.    │
│                                                          │
│  ✅ vite build + vite preview (WORKS)                     │
│                                                          │
│  vite build generates:                                    │
│  └── dist/assets/remoteEntry.js  ← Federation manifest   │
│                                                          │
│  vite preview serves the built output as static files    │
│  with proper CORS headers.                               │
└──────────────────────────────────────────────────────────┘
```

---

## Step 8: Environment Configuration

```
host/.env.development          host/.env.production
┌────────────────────────┐     ┌──────────────────────────────┐
│ VITE_API_URL=           │     │ VITE_API_URL=                 │
│  http://localhost:3001  │     │  http://localhost:3001         │
│                         │     │                               │
│ VITE_MFE_AUTH_URL=      │     │ VITE_MFE_AUTH_URL=            │
│  http://localhost:5001/ │     │  http://localhost:5001/        │
│  assets/remoteEntry.js  │     │  assets/remoteEntry.js        │
│                         │     │                               │
│ (Direct to dev servers) │     │ (Full URLs for local preview) │
└────────────────────────┘     └──────────────────────────────┘

Note: For production behind nginx, change to relative paths:
  VITE_MFE_AUTH_URL=/mfe-auth/assets/remoteEntry.js
```

---

## Step 9: Navigation Guards & Error Handling

```
┌─────────────────────────────────────────────────────────┐
│               Router Navigation Guards                    │
│                                                          │
│  beforeEach(to, from, next)                              │
│       │                                                  │
│       ├── to.meta.requiresAuth && !isAuthenticated?      │
│       │       → redirect to /login                       │
│       │                                                  │
│       ├── to.meta.requiresAdmin && !isAdmin?             │
│       │       → redirect to /                            │
│       │                                                  │
│       ├── to.meta.guest && isAuthenticated?              │
│       │       → redirect to /                            │
│       │                                                  │
│       └── else → next() (allow navigation)               │
│                                                          │
│  Remote Loading Error Boundary:                           │
│  ┌────────────────────────────────────────────────┐     │
│  │  loadRemote(() => import('mfeAuth/Login'))      │     │
│  │    .catch(() => import('RemoteError.vue'))      │     │
│  │                                                 │     │
│  │  If remote server is down → shows error page    │     │
│  │  instead of crashing the entire app             │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## Step 10: Production Deployment (Docker + Nginx)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Architecture                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Nginx (Port 80)                        │   │
│  │                                                            │   │
│  │  /              → host/dist/                               │   │
│  │  /mfe-auth/     → mfe-auth/dist/                          │   │
│  │  /mfe-products/ → mfe-products/dist/                      │   │
│  │  /mfe-cart/     → mfe-cart/dist/                          │   │
│  │  /mfe-checkout/ → mfe-checkout/dist/                      │   │
│  │  /mfe-orders/   → mfe-orders/dist/                        │   │
│  │  /mfe-admin/    → mfe-admin/dist/                         │   │
│  │                                                            │   │
│  │  All served as static files - no Node.js servers needed!  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Docker Compose:                                                  │
│  ┌────────────────────────┐                                      │
│  │  Stage 1: Build        │  node:20 → npm run build (all)       │
│  │  Stage 2: Serve        │  nginx:alpine → serve dist/ files    │
│  └────────────────────────┘                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step 11: REST API Server (Express.js)

### Purpose:

Full-featured backend API that replaces static mock data with real CRUD operations.

```
api-server/
├── package.json
└── server.js     ← Express.js + JWT + In-memory data store
```

### Endpoints:

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Server (Port 3001)                         │
│                                                                   │
│  Auth:                                                            │
│  POST /api/auth/login     ← Returns JWT token                    │
│  POST /api/auth/register  ← Creates user + returns token         │
│  GET  /api/auth/me        ← Returns current user (JWT required)  │
│                                                                   │
│  Products:                                                        │
│  GET    /api/products     ← Search, filter, sort, paginate       │
│  GET    /api/products/:id ← Single product                       │
│  POST   /api/products     ← Create (admin only)                  │
│  PUT    /api/products/:id ← Update (admin only)                  │
│  DELETE /api/products/:id ← Delete (admin only)                  │
│                                                                   │
│  Cart & Wishlist:                                                 │
│  GET/POST/PUT/DELETE /api/cart      ← Cart CRUD                  │
│  GET/POST/DELETE     /api/wishlist  ← Wishlist CRUD              │
│                                                                   │
│  Orders:                                                          │
│  GET  /api/orders      ← List (filter by status)                 │
│  GET  /api/orders/:id  ← Single order                            │
│  POST /api/orders      ← Create new order                        │
│  PUT  /api/orders/:id  ← Update status (admin)                   │
│                                                                   │
│  Admin:                                                           │
│  GET /api/admin/stats  ← Dashboard stats                         │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow:

```
┌──────────────────────────────────────────────────────────┐
│  1. User submits login form (mfe-auth/Login.vue)          │
│  2. Component calls authApi.login(email, password)        │
│  3. API server validates → returns JWT token              │
│  4. Token stored in localStorage + Pinia auth store       │
│  5. HTTP client auto-injects token on subsequent requests │
│  6. Protected routes check JWT → return 401 if invalid    │
└──────────────────────────────────────────────────────────┘
```

---

## Step 12: Composables & Utilities

### Composables (Vue 3 Composition Hooks):

```
┌─────────────────────────────────────────────────────────────┐
│                     Composables Layer                         │
│  (Reusable logic between components and stores)              │
│                                                              │
│  useApi(apiFn)        → Generic: { data, loading, error }    │
│  useProducts(opts?)   → Products with debounced search       │
│  useOrders()          → Orders CRUD wrapper                  │
│  useCart()            → Formatted totals, free shipping      │
│  useDebounce(ref, ms) → Reactive debounced value             │
│  useNotification()    → Toast helper (success/error/warning) │
│  usePagination(opts?) → Page state + navigation              │
└─────────────────────────────────────────────────────────────┘
```

### Utility Functions:

```
┌─────────────────────────────────────────────────────────────┐
│                     Utilities Layer                           │
│  (Pure functions - no Vue dependency)                        │
│                                                              │
│  currency.ts  → formatCurrency($29.99), calculateTax()      │
│  date.ts      → formatRelativeTime("3 hours ago")           │
│  validators.ts→ validateEmail() → { valid, message }        │
│  storage.ts   → Type-safe localStorage wrapper              │
│  debounce.ts  → debounce(fn, 400), throttle(fn, 200)       │
│  string.ts    → slugify("Hello World") → "hello-world"      │
└─────────────────────────────────────────────────────────────┘
```

### Per-MFE API Composables:

```
┌─────────────────────────────────────────────────────────────┐
│              Per-MFE Composables (axios-based)                │
│  (Each MFE has its own http.ts + API composables)            │
│                                                              │
│  host/composables/                                           │
│    http.ts          → axios instance (baseURL: localhost:3001)│
│    useHomeApi.ts    → Featured products, categories          │
│                                                              │
│  mfe-products/composables/                                   │
│    http.ts          → axios instance                         │
│    useProductsApi.ts→ Products CRUD, search, filter          │
│    useCategoriesApi.ts → Category listing                    │
│                                                              │
│  mfe-checkout/composables/                                   │
│    http.ts          → axios instance                         │
│    useCheckoutApi.ts→ Order creation                         │
│                                                              │
│  mfe-orders/composables/                                     │
│    http.ts          → axios instance                         │
│    useOrdersApi.ts  → Fetch orders, order detail             │
│                                                              │
│  mfe-admin/composables/                                      │
│    http.ts          → axios instance                         │
│    useAdminProductsApi.ts → Products CRUD (admin)            │
│    useAdminOrdersApi.ts   → Order management                 │
│    useAdminStatsApi.ts    → Dashboard statistics             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 13: Styling — Tailwind CSS 4

### Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                   Tailwind CSS Setup                          │
│                                                              │
│  shared/tailwind.preset.js   ← Design tokens (all MFEs)     │
│    • Colors: primary (Indigo), accent (Emerald), danger (Rose)│
│    • Fonts: Inter, system-ui, sans-serif                     │
│    • Shadows: shadow-card, shadow-elevated                   │
│                                                              │
│  Root (workspace level):                                     │
│    tailwind.config.mjs       ← Imports shared preset         │
│    postcss.config.mjs        ← @tailwindcss/postcss plugin   │
│                                                              │
│  {each-mfe}/                                                 │
│    src/assets/tailwind.css   ← @import "tailwindcss" + classes│
│                                                              │
│  Component Classes (defined in each tailwind.css):           │
│    .btn-primary  → Indigo button                             │
│    .btn-accent   → Emerald CTA button                        │
│    .btn-danger   → Rose destructive button                   │
│    .btn-outline  → Bordered subtle button                    │
│    .btn-ghost    → Transparent text button                   │
│    .input        → Form input with focus ring                │
│    .card         → White rounded shadow container            │
│    .badge        → Small pill label                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Points:

- **No scoped CSS** — all styling via Tailwind utilities + component classes
- **Tailwind v4** uses `@import "tailwindcss"` + `@config` (not `@tailwind` directives)
- **@tailwindcss/postcss** replaces the old `tailwindcss` PostCSS plugin
- **Shared preset** ensures consistent colors/fonts across all MFEs
- **Centralized config** — single `tailwind.config.mjs` + `postcss.config.mjs` at workspace root (no per-MFE duplication)

---

## Step 14: Testing (Vitest)

### Test Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Suite (113+ tests)                    │
│                                                              │
│  Store Tests (with vi.mock for API isolation):               │
│  ├── auth.spec.ts        → 10 tests (login/logout/register) │
│  ├── cart.spec.ts        → 15 tests (CRUD, shipping, wish)  │
│  ├── products.spec.ts   → 10 tests (CRUD, filters)          │
│  ├── orders.spec.ts     → 10 tests (status management)      │
│  └── notification.spec.ts→ 9 tests (auto-dismiss)           │
│                                                              │
│  Utility Tests:                                              │
│  ├── utils-currency.spec.ts   → 10 tests                    │
│  ├── utils-date.spec.ts       → 10 tests (fake timers)      │
│  ├── utils-validators.spec.ts → 16 tests                    │
│  ├── utils-string.spec.ts     → 14 tests                    │
│  └── utils-debounce.spec.ts   → 9 tests (fake timers)       │
│                                                              │
│  Composable Tests:                                           │
│  └── composables-pagination.spec.ts → 10 tests              │
└─────────────────────────────────────────────────────────────┘
```

### Running Tests:

```bash
npm test              # Watch mode
npm run test:coverage # Coverage report
npx vitest run        # Single run (CI)
```

---

## Key Technologies Used

| Technology                       | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| Vue 3.4                          | UI Framework (Composition API + `<script setup>`) |
| TypeScript 5.4                   | Type safety across all MFEs                       |
| Vite 5.4                         | Build tool + dev server                           |
| @originjs/vite-plugin-federation | Module Federation for Vite                        |
| Pinia 2.1                        | State management (5 stores shared across MFEs)    |
| Vue Router 4.3                   | Client-side routing with lazy loading             |
| Express.js 4.18                  | REST API server with JWT authentication           |
| Vitest 1.4                       | Unit testing (113+ tests, 11 test files)          |
| npm Workspaces                   | Monorepo dependency management (9 workspaces)     |
| concurrently                     | Run multiple preview servers + API                |
| Docker + Nginx                   | Production deployment                             |

---

## Common Pitfalls & Solutions

| Problem                    | Cause                                                       | Solution                                                     |
| -------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| Blank page                 | Top-level `await` from shared modules blocks module loading | Use async boundary: `main.ts` → `import('./bootstrap')`      |
| `_s` undefined error       | Remote uses isolated Pinia (not host's instance)            | Keep `shared: ['vue', 'vue-router', 'pinia']` in host config |
| remoteEntry.js 404         | `vite dev` doesn't generate federation bundles              | Use `vite build` + `vite preview` for all MFEs               |
| Wrong remote URLs in build | Default build uses production env (nginx paths)             | Build with `--mode development` for local preview            |
| Port conflicts             | Leftover node processes from crashed servers                | Kill processes: `Get-NetTCPConnection -LocalPort 5000..5006` |
| manualChunks conflict      | Custom chunking breaks federation's chunk resolution        | Remove `rollupOptions.output.manualChunks` from host         |

---

## Running the Application

```bash
# 1. Install all dependencies
npm install

# 2. Start everything (API server + build MFEs + serve all)
npm run dev

# This runs:
#   - API server on http://localhost:3001
#   - Builds all 6 MFE remotes
#   - Builds host with --mode development (localhost URLs)
#   - Starts preview servers on ports 5000-5006

# 3. Open http://localhost:5000

# ─── Alternative: Manual Step-by-Step ───────────────────────

# Start API server separately:
cd api-server && node server.js

# Build all remotes:
npm run build --workspace=mfe-auth
npm run build --workspace=mfe-products
npm run build --workspace=mfe-cart
npm run build --workspace=mfe-checkout
npm run build --workspace=mfe-orders
npm run build --workspace=mfe-admin

# Build host (development mode for localhost URLs):
cd host && npx vite build --mode development && cd ..

# Start all preview servers:
npx concurrently \
  "npm run preview --workspace=mfe-auth" \
  "npm run preview --workspace=mfe-products" \
  "npm run preview --workspace=mfe-cart" \
  "npm run preview --workspace=mfe-checkout" \
  "npm run preview --workspace=mfe-orders" \
  "npm run preview --workspace=mfe-admin" \
  "npm run preview --workspace=host"

# ─── Run Tests ──────────────────────────────────────────────

npm test              # Watch mode
npm run test:coverage # With coverage

# 4. Open http://localhost:5000
```
