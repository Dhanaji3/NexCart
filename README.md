# Vue 3 E-Commerce Micro Frontends Platform

A production-ready e-commerce platform built with **Vue 3**, **TypeScript**, and **Micro Frontend Architecture** using Vite Module Federation.

## Recent implementation updates

- Cart quantity updates now work through PUT /api/cart/{productId} with a JSON body such as {"quantity": 2}; the legacy query-string form remains compatible.
- Admin product edits now persist stock values correctly. The UI can send either stock or inStock, and the backend stores the explicit stock value while deriving availability from it.
- Customer order history uses GET /api/orders for the signed-in user, while admins list all orders through GET /api/admin/orders. Status changes are submitted to PUT /api/admin/orders/{id}/status.

### Recent Fixes & Notes

- Database: `orders.status` CHECK constraint was missing `PROCESSING` causing admin updates to fail with 400. A remediation script exists at `backend/backend-springboot/update_status_check.sql` and should be applied as a migration in production (Flyway/Liquibase recommended).
- Backend: `AdminController` and `OrderService` were updated to accept and persist an optional `trackingNumber` parameter on status updates.
- Frontend: `mfe-admin` now sends PUT `/api/admin/orders/{id}/status` with a `null` body and query params (`status` and optional `trackingNumber`). The `mfe-orders` `OrderDetail.vue` stepper was visually improved (connector positioned at 40%; progress overlay computed from the current step).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
5. [Micro Frontend Details](#micro-frontend-details)
6. [Running the Application](#running-the-application)
7. [How Module Federation Works](#how-module-federation-works)
8. [Adding a New Micro Frontend](#adding-a-new-micro-frontend)
9. [Shared State Management](#shared-state-management)
10. [Production Ready Features](#production-ready-features)
11. [Testing](#testing)
12. [Docker Deployment](#docker-deployment)
13. [CI/CD Pipeline](#cicd-pipeline)
14. [AWS Production Deployment](#aws-production-deployment)
15. [Free Deployment Guide](#free-deployment-guide)
16. [Features](#features)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    HOST SHELL (Port 5000)                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Vue Router + Navigation + Shared Layout                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              │                                 │
│         Module Federation (Runtime Remote Loading)             │
│                              │                                 │
│  ┌──────┐ ┌──────────┐ ┌──────┐ ┌─────────┐ ┌──────┐ ┌─────┐│
│  │ Auth │ │ Products │ │ Cart │ │Checkout │ │Orders│ │Admin││
│  │:5001 │ │  :5002   │ │:5003 │ │  :5004  │ │:5005 │ │:5006││
│  └──────┘ └──────────┘ └──────┘ └─────────┘ └──────┘ └─────┘│
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┘
              ▼
     ┌─────────────────┐
     │  Shared Library  │
     │  (Types, Stores, │
     │   Mock Data)     │
     └─────────────────┘
```

---

## Technology Stack

| Technology           | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| Vue 3.4              | UI framework (Composition API + `<script setup>`)             |
| TypeScript 5.4       | Type safety across all micro frontends                        |
| Vite 5.4             | Fast build tool for development & production                  |
| Module Federation    | `@originjs/vite-plugin-federation` for runtime module sharing |
| Vue Router 4.3       | Client-side routing with lazy-loaded remote components        |
| Pinia 2.1            | Shared state management (3 stores: auth, cart, notification)  |
| Tailwind CSS 4.3     | Utility-first CSS framework (root config + shared preset)     |
| @tailwindcss/postcss | PostCSS plugin for Tailwind v4                                |
| Axios 1.x            | HTTP client (per-MFE composables + shared internal)           |
| Express.js 4.18      | REST API server with JWT authentication                       |
| npm Workspaces       | Monorepo management (9 workspaces)                            |
| Concurrently         | Run all MFEs + API server in parallel                         |
| ESLint 9             | Code quality & linting (flat config)                          |
| Prettier             | Code formatting                                               |
| Vitest 1.4           | Unit testing framework (113+ tests)                           |
| Docker + Nginx       | Containerized production deployment                           |
| GitHub Actions       | CI/CD pipeline (lint, test, build, deploy)                    |

---

## Project Structure

```
vue-micro-frontends/
├── package.json              ← Root workspace config
├── .env                      ← Shared env (VITE_API_URL) for all MFEs
├── tailwind.config.mjs       ← Root Tailwind config (imports shared preset, scans all MFEs)
├── postcss.config.mjs        ← Root PostCSS config (@tailwindcss/postcss)
├── README.md                 ← This file
│
├── api-server/               ← REST API Server (Port 3001)
│   ├── package.json
│   └── server.js             ← Express.js with JWT auth, CRUD endpoints
│
├── shared/                   ← Shared library (types, stores, composables, utils)
│   ├── package.json
│   ├── vitest.config.ts
│   ├── tailwind.preset.js    ← Shared Tailwind design tokens (colors, fonts, shadows)
│   └── src/
│       ├── index.ts          ← Barrel exports (types, stores, composables, utils)
│       ├── types.ts          ← 30+ TypeScript interfaces & types
│       ├── api.ts            ← Internal API layer (auth, cart, wishlist) using axios
│       ├── composables/      ← Vue 3 Composition API hooks
│       │   ├── index.ts
│       │   ├── useApi.ts     ← Generic API wrapper (loading/error)
│       │   ├── useCart.ts    ← Cart with formatted totals
│       │   ├── useDebounce.ts← Reactive debounced ref
│       │   ├── useNotification.ts ← Toast notifications
│       │   └── usePagination.ts   ← Pagination state
│       ├── utils/            ← Reusable utility functions
│       │   ├── index.ts
│       │   ├── currency.ts   ← Money formatting & calculations
│       │   ├── date.ts       ← Date formatting & relative time
│       │   ├── validators.ts ← Form validation with messages
│       │   ├── storage.ts    ← Type-safe localStorage wrapper
│       │   ├── debounce.ts   ← debounce() & throttle()
│       │   └── string.ts     ← truncate, slugify, capitalize
│       ├── stores/
│       │   ├── auth.ts       ← Authentication store
│       │   ├── cart.ts       ← Cart & wishlist store
│       │   └── notification.ts ← Toast notifications store
│       └── data/
│           └── products.ts   ← Mock product/order data
│   └── __tests__/            ← 11 test files (113+ tests)
│       ├── auth.spec.ts
│       ├── cart.spec.ts
│       ├── products.spec.ts
│       ├── orders.spec.ts
│       ├── notification.spec.ts
│       ├── utils-currency.spec.ts
│       ├── utils-date.spec.ts
│       ├── utils-validators.spec.ts
│       ├── utils-string.spec.ts
│       ├── utils-debounce.spec.ts
│       └── composables-pagination.spec.ts
│
├── host/                     ← Shell Application (Port 5000)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts        ← Federation consumer config
│   ├── tsconfig.json
│   ├── env.d.ts              ← Remote module type declarations
│   ├── .env.development      ← localhost URLs (MFE remotes)
│   ├── .env.production       ← production MFE URLs
│   └── src/
│       ├── main.ts           ← App entry (Pinia + Router)
│       ├── bootstrap.ts      ← Async boundary bootstrap
│       ├── assets/
│       │   └── tailwind.css  ← Tailwind entry + component classes
│       ├── composables/      ← API composables
│       │   ├── index.ts
│       │   ├── http.ts       ← Configured axios instance
│       │   └── useHomeApi.ts ← Home page data (featured, categories)
│       ├── App.vue           ← Shell layout (nav, footer)
│       ├── router/index.ts   ← All routes (lazy-loads remotes)
│       └── views/
│           ├── HomeView.vue  ← Landing page
│           ├── NotFound.vue  ← 404 page
│           └── RemoteError.vue ← Federation error fallback
│
├── mfe-auth/                 ← Auth Micro Frontend (Port 5001)
│   ├── package.json
│   ├── vite.config.ts        ← Exposes: Login, Register, Profile
│   └── src/
│       ├── main.ts
│       ├── assets/
│       │   └── tailwind.css
│       └── components/
│           ├── Login.vue
│           ├── Register.vue
│           └── Profile.vue
│
├── mfe-products/             ← Products Micro Frontend (Port 5002)
│   ├── package.json
│   ├── vite.config.ts        ← Exposes: ProductList, ProductDetail
│   └── src/
│       ├── main.ts
│       ├── assets/
│       │   └── tailwind.css
│       ├── composables/      ← API composables (axios-based)
│       │   ├── index.ts
│       │   ├── http.ts       ← Configured axios instance
│       │   ├── useProductsApi.ts ← Products CRUD
│       │   └── useCategoriesApi.ts ← Categories fetch
│       └── components/
│           ├── ProductList.vue
│           └── ProductDetail.vue
│
├── mfe-cart/                 ← Cart Micro Frontend (Port 5003)
│   ├── package.json
│   ├── vite.config.ts        ← Exposes: Cart, Wishlist
│   └── src/
│       ├── main.ts
│       ├── assets/
│       │   └── tailwind.css
│       └── components/
│           ├── Cart.vue
│           └── Wishlist.vue
│
├── mfe-checkout/             ← Checkout Micro Frontend (Port 5004)
│   ├── package.json
│   ├── vite.config.ts        ← Exposes: Checkout
│   └── src/
│       ├── main.ts
│       ├── assets/
│       │   └── tailwind.css
│       ├── composables/
│       │   ├── index.ts
│       │   ├── http.ts
│       │   └── useCheckoutApi.ts ← Order creation
│       └── components/
│           └── Checkout.vue
│
├── mfe-orders/               ← Orders Micro Frontend (Port 5005)
│   ├── package.json
│   ├── vite.config.ts        ← Exposes: OrderList, OrderDetail
│   └── src/
│       ├── main.ts
│       ├── assets/
│       │   └── tailwind.css
│       ├── composables/
│       │   ├── index.ts
│       │   ├── http.ts
│       │   └── useOrdersApi.ts ← Orders fetch
│       └── components/
│           ├── OrderList.vue
│           └── OrderDetail.vue
│
└── mfe-admin/                ← Admin Micro Frontend (Port 5006)
    ├── package.json
    ├── vite.config.ts        ← Exposes: AdminDashboard, AdminProducts, AdminOrders
    └── src/
        ├── main.ts
        ├── assets/
        │   └── tailwind.css
        ├── composables/
        │   ├── index.ts
        │   ├── http.ts
        │   ├── useAdminProductsApi.ts ← Products CRUD (admin)
        │   ├── useAdminOrdersApi.ts   ← Orders management
        │   └── useAdminStatsApi.ts    ← Dashboard stats
        └── components/
            ├── AdminDashboard.vue
            ├── AdminProducts.vue
            └── AdminOrders.vue
```

---

## Step-by-Step Setup Guide

### Step 1: Prerequisites

Ensure you have installed:

- **Node.js** >= 18
- **npm** >= 9

### Step 2: Install Dependencies

```bash
cd vue-micro-frontends
npm install
```

This installs all workspace dependencies at once (npm workspaces handles linking).

### Step 3: Understanding the Workspace Setup

The root `package.json` defines npm workspaces:

```json
{
  "workspaces": [
    "shared",
    "host",
    "mfe-auth",
    "mfe-products",
    "mfe-cart",
    "mfe-checkout",
    "mfe-orders",
    "mfe-admin"
  ]
}
```

Each workspace is a self-contained app that can be developed independently.

### Step 4: Start Development (All MFEs)

```bash
npm run dev
```

This runs `concurrently` to start all 7 services:

| Service      | URL                   | Description                       |
| ------------ | --------------------- | --------------------------------- |
| API Server   | http://localhost:3001 | REST API (products, auth, orders) |
| Host Shell   | http://localhost:5000 | Main app with router & layout     |
| MFE Auth     | http://localhost:5001 | Login, Register, Profile          |
| MFE Products | http://localhost:5002 | Product catalog                   |
| MFE Cart     | http://localhost:5003 | Shopping cart & wishlist          |
| MFE Checkout | http://localhost:5004 | Checkout flow                     |
| MFE Orders   | http://localhost:5005 | Order history & tracking          |
| MFE Admin    | http://localhost:5006 | Admin panel                       |

### Step 5: Start Individual MFEs

You can also develop a single MFE independently:

```bash
npm run dev:auth       # Start only the auth MFE
npm run dev:products   # Start only the products MFE
npm run dev:host       # Start only the host shell
```

### Step 6: Build for Production

```bash
npm run build
```

This builds all workspaces. Each MFE produces a `dist/` folder with:

- `assets/remoteEntry.js` — The federation entry point
- Standard Vite build output

### Step 7: Preview Production Build

```bash
npm run preview
```

---

## Micro Frontend Details

### MFE Auth (`mfe-auth`)

- **Login** — Email/password authentication with mock API
- **Register** — User registration with validation
- **Profile** — View/edit profile, role badge, quick actions
- **Tip**: Use an email containing "admin" to get admin role

### MFE Products (`mfe-products`)

- **Product List** — Grid view with search, category filter, sort
- **Product Detail** — Full product page with related items
- **Add to Cart** — Direct cart integration via shared store
- **Wishlist** — Save items for later

### MFE Cart (`mfe-cart`)

- **Shopping Cart** — Quantity controls, remove items, order summary
- **Wishlist** — View saved items, move to cart
- **Free shipping** over $50

### MFE Checkout (`mfe-checkout`)

- **3-Step Flow**: Shipping → Payment → Review
- **Payment Methods**: Credit card, PayPal, Apple Pay
- **Order Confirmation** with success page

### MFE Orders (`mfe-orders`)

- **Order List** — All orders with status badges
- **Order Detail** — Status tracker, tracking number, items breakdown

### MFE Admin (`mfe-admin`)

- **Dashboard** — Revenue stats, recent orders
- **Product Management** — CRUD table with edit/delete modal
- **Order Management** — Update order status

---

## How Module Federation Works

### 1. Remote Apps EXPOSE components

Each MFE's `vite.config.ts` exposes components:

```typescript
// mfe-products/vite.config.ts
federation({
  name: "mfeProducts",
  filename: "remoteEntry.js",
  exposes: {
    "./ProductList": "./src/components/ProductList.vue",
    "./ProductDetail": "./src/components/ProductDetail.vue",
  },
  shared: ["vue", "vue-router", "pinia"],
});
```

### 2. Host CONSUMES remote modules

The host's `vite.config.ts` declares remotes:

```typescript
// host/vite.config.ts
federation({
  name: "host",
  remotes: {
    mfeProducts: "http://localhost:5002/assets/remoteEntry.js",
  },
  shared: ["vue", "vue-router", "pinia"],
});
```

### 3. Router LAZY-LOADS remote components

```typescript
// host/src/router/index.ts
{
  path: '/products',
  component: () => import('mfeProducts/ProductList'),
}
```

### 4. Shared dependencies are loaded ONCE

Vue, Vue Router, and Pinia are declared as `shared` — they're loaded once and shared across all MFEs at runtime.

---

## Adding a New Micro Frontend

1. **Create folder**: `mfe-<name>/`
2. **Copy boilerplate** from any existing MFE
3. **Update `vite.config.ts`** — Set unique `name`, `filename`, and `exposes`
4. **Add remote** in `host/vite.config.ts`
5. **Add type declaration** in `host/env.d.ts`
6. **Add routes** in `host/src/router/index.ts`
7. **Add workspace** in root `package.json`
8. **Run `npm install`** to link

---

## Shared State Management

The `shared/` package provides 5 Pinia stores used across all MFEs:

### Auth Store (`useAuthStore`)

- `user` / `token` / `loading` / `error` — State
- `isAuthenticated` / `isAdmin` — Computed
- `login()` / `register()` / `logout()` / `updateProfile()` / `fetchUser()`

### Cart Store (`useCartStore`)

- `items[]` / `wishlist[]` — State
- `totalItems` / `totalPrice` / `shipping` / `grandTotal` — Computed
- `addToCart()` / `removeFromCart()` / `updateQuantity()` / `clearCart()`
- `addToWishlist()` / `removeFromWishlist()` / `isInWishlist()` / `isInCart()`
- `fetchCart()` / `fetchWishlist()` — API sync for logged-in users

### Products Store (`useProductsStore`) — NEW

- `products[]` / `categories[]` / `selectedProduct` — State
- `searchQuery` / `selectedCategory` / `sortBy` — Filters
- `fetchProducts()` / `fetchCategories()` / `fetchProductById()`
- `createProduct()` / `updateProduct()` / `deleteProduct()` — Admin CRUD

### Orders Store (`useOrdersStore`) — NEW

- `orders[]` / `currentOrder` / `statusFilter` — State
- `filteredOrders` / `pendingOrders` — Computed
- `fetchOrders()` / `fetchOrderById()` / `createOrder()` / `updateStatus()`

### Notification Store (`useNotificationStore`) — NEW

- `notifications[]` — State
- `add({ type, title, message, duration })` / `remove(id)` / `clearAll()`
- Auto-removes after duration (default 5000ms)

Since Pinia is a shared dependency, the **same store instance** is used across all micro frontends.

---

## Composables (Vue 3 Hooks)

Reusable composition functions in `shared/src/composables/`:

| Composable                | Purpose                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `useApi(apiFn)`           | Generic API wrapper → `{ data, loading, error, execute, reset }` |
| `useProducts(opts?)`      | Products with search, filter, sort, pagination                   |
| `useOrders()`             | Orders CRUD with status management                               |
| `useCart()`               | Cart operations + formatted totals + free shipping logic         |
| `useDebounce(ref, delay)` | Reactive debounced value                                         |
| `useNotification()`       | Toast notification helper                                        |
| `usePagination(opts?)`    | Page state, navigation, pageRange computed                       |

---

## Utility Functions

Reusable utilities in `shared/src/utils/`:

| Module          | Functions                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `currency.ts`   | `formatCurrency()`, `formatCompactCurrency()`, `calculateDiscount()`, `calculateTax()`               |
| `date.ts`       | `formatDate()`, `formatRelativeTime()`, `formatDateTime()`, `isToday()`                              |
| `validators.ts` | `validateEmail()`, `validatePassword()`, `validatePhone()`, `validateZipCode()`, `validateAddress()` |
| `storage.ts`    | `storage.get/set/remove/has`, `sessionStore.*`, `STORAGE_KEYS` constants                             |
| `debounce.ts`   | `debounce()`, `throttle()`                                                                           |
| `string.ts`     | `truncate()`, `slugify()`, `capitalize()`, `generateId()`, `pluralize()`                             |

---

## Features

### Customer Features

- [x] User registration & login
- [x] Product browsing with search & filters
- [x] Product detail pages with related products
- [x] Shopping cart (add, remove, update quantity)
- [x] Wishlist management
- [x] Multi-step checkout (shipping, payment, review)
- [x] Order history with status tracking
- [x] User profile management
- [x] Responsive design (Tailwind CSS utility classes)

### Admin Features

- [x] Admin dashboard with revenue stats
- [x] Product management (CRUD)
- [x] Order management with status updates

### Technical Features

- [x] Tailwind CSS 4 (utility-first, shared preset, per-MFE isolation)
- [x] Micro frontend architecture (Module Federation)
- [x] Runtime module loading (no build-time coupling)
- [x] REST API server (Express.js + JWT authentication)
- [x] Shared state across MFEs (Pinia - 5 stores)
- [x] Vue 3 composables (7 reusable hooks)
- [x] Utility library (6 modules - currency, date, validators, storage, debounce, string)
- [x] 30+ TypeScript interfaces & models
- [x] 113+ unit tests with full API mocking
- [x] TypeScript throughout
- [x] Independent development & deployment per MFE
- [x] Vue Router with lazy-loaded remote components
- [x] npm workspaces monorepo (9 workspaces)
- [x] Route guards (auth + admin protection)
- [x] Error boundaries for remote module failures
- [x] Suspense loading states
- [x] Environment-based configuration
- [x] ESLint 9 + Prettier code quality
- [x] Vitest unit testing with coverage
- [x] Docker multi-stage builds
- [x] Nginx reverse proxy with security headers
- [x] GitHub Actions CI/CD pipeline
- [x] Global error handling
- [x] Typed HTTP client utility
- [x] 404 page handling

---

## Troubleshooting

| Issue                        | Solution                                                         |
| ---------------------------- | ---------------------------------------------------------------- |
| Remote module not loading    | Ensure the MFE is running on its correct port                    |
| Shared state not syncing     | Make sure Pinia is in `shared` array of all configs              |
| TypeScript errors on imports | Check `env.d.ts` has module declarations                         |
| Port conflict                | Change port in the MFE's `vite.config.ts` and update host config |

---

## Production Ready Features

### Environment Configuration

Remote URLs are configured via `.env` files (not hardcoded):

```bash
# host/.env.development
VITE_MFE_AUTH_URL=http://localhost:5001/assets/remoteEntry.js

# host/.env.production (use full URLs for local preview, relative for nginx)
VITE_MFE_AUTH_URL=http://localhost:5001/assets/remoteEntry.js
```

### Route Guards

Routes are protected with navigation guards:

- **`requiresAuth`** — Redirects to `/login` if not authenticated
- **`requiresAdmin`** — Redirects to `/` if not admin role
- **`guest`** — Redirects authenticated users away from login/register

### Error Boundaries

Remote module loading failures are gracefully handled:

- `loadRemote()` wrapper catches import failures
- Renders a user-friendly error page with retry option
- `<Suspense>` provides loading spinner during async component load

### Global Error Handling

```typescript
app.config.errorHandler = (err, instance, info) => {
  console.error("[Global Error]", err);
};
```

### HTTP Client & API Layer

A shared typed HTTP client (`shared/src/http.ts`) and API service (`shared/src/api.ts`) provide:

- Automatic JWT token injection via Authorization header
- Request/response type safety with generics
- Centralized error handling with typed `ApiErrorResponse`
- Full REST API services: `authApi`, `productsApi`, `cartApi`, `ordersApi`, `adminApi`

### REST API Server (`api-server/`)

Express.js server on port 3001 providing:

- **Auth endpoints**: POST `/api/auth/login`, `/api/auth/register`, GET `/api/auth/me`
- **Products**: GET/POST/PUT/DELETE `/api/products`, with search, filter, sort, pagination
- **Categories**: GET `/api/categories`
- **Cart**: GET/POST/PUT/DELETE `/api/cart`
- **Wishlist**: GET/POST/DELETE `/api/wishlist`
- **Orders**: GET/POST/PUT `/api/orders`
- **Admin**: GET `/api/admin/stats`
- JWT authentication with role-based access control
- CORS enabled for cross-origin MFE access

### Security Headers (Nginx)

Production nginx config includes:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- CORS headers for module federation

### Code Quality

```bash
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix issues
npm run format        # Prettier formatting
npm run type-check    # TypeScript validation
```

---

## Testing

Unit tests use **Vitest** with `vi.mock` for API isolation:

```bash
npm run test              # Watch mode
npm run test:coverage     # Coverage report
```

### Test Coverage (11 files, 113+ tests):

| Test File                        | Tests | Coverage                                         |
| -------------------------------- | ----- | ------------------------------------------------ |
| `auth.spec.ts`                   | 10    | Login, logout, register, profile, loading states |
| `cart.spec.ts`                   | 15    | Add/remove, quantity, shipping logic, wishlist   |
| `products.spec.ts`               | 10    | CRUD operations, filters, pagination             |
| `orders.spec.ts`                 | 10    | Fetch, create, status management                 |
| `notification.spec.ts`           | 9     | Add, remove, auto-dismiss, clearAll              |
| `utils-currency.spec.ts`         | 10    | Formatting, discount, tax calculations           |
| `utils-date.spec.ts`             | 10    | Format, relative time (with fake timers)         |
| `utils-validators.spec.ts`       | 16    | Email, password, phone, zip, address             |
| `utils-string.spec.ts`           | 14    | Truncate, slugify, capitalize, pluralize         |
| `utils-debounce.spec.ts`         | 9     | Debounce & throttle (with fake timers)           |
| `composables-pagination.spec.ts` | 10    | Page navigation, range, boundaries               |

```
shared/__tests__/
├── auth.spec.ts
├── cart.spec.ts
├── products.spec.ts
├── orders.spec.ts
├── notification.spec.ts
├── utils-currency.spec.ts
├── utils-date.spec.ts
├── utils-validators.spec.ts
├── utils-string.spec.ts
├── utils-debounce.spec.ts
└── composables-pagination.spec.ts
```

---

## Docker Deployment

### Build and run with Docker Compose:

```bash
docker-compose up --build
```

This:

1. Builds each MFE as a multi-stage Docker image (Node build → Nginx serve)
2. The host acts as a reverse proxy, routing `/mfe-*` paths to internal services
3. All services communicate via Docker networking

### Individual image build:

```bash
docker build --build-arg APP_NAME=mfe-products -t mfe-products .
```

> For AWS production deployment, follow the full guide in `project-docs/root-docs/AWS_PRODUCTION_DEPLOY.md`.

---

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

| Stage  | Trigger     | Actions                                |
| ------ | ----------- | -------------------------------------- |
| Lint   | Push/PR     | ESLint + TypeScript type-check         |
| Test   | After lint  | Vitest with coverage report            |
| Build  | After test  | Matrix build of all 8 workspaces       |
| Docker | Main branch | Build & push images to GitHub Registry |

---

## AWS Production Deployment

A complete enterprise-grade AWS deployment guide is available in `project-docs/root-docs/AWS_PRODUCTION_DEPLOY.md`.
It includes step-by-step instructions for:

- creating an EKS cluster
- provisioning ECR repositories
- building and pushing Docker images
- setting up S3 backups with Terraform
- installing cert-manager and configuring ingress
- applying production Kubernetes manifests
- validating the deployment and rolling back if needed

> Use this guide as your primary enterprise production deployment checklist for AWS.

---

## Free Deployment Guide

For a free-tier demo deployment, see `project-docs/root-docs/FREE_DEPLOYMENT_GUIDE.md`.
This guide covers:

- deploying the backend with Railway or Render
- using a free Postgres database from Railway or Supabase
- deploying each MFE as a separate static site on Vercel, Netlify, or Cloudflare Pages
- setting the `VITE_API_URL` and `VITE_MFE_*_URL` values for the host
- the minimal demo path with the fewest required apps

> This is the recommended guide for a non-production, free demo deployment.

---

## License

MIT
