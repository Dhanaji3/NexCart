# Vue 3 Micro-Frontends E-Commerce Platform - Complete Project Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Deep Dive](#2-architecture-deep-dive)
3. [Complete File Structure](#3-complete-file-structure)
4. [Shared Library (Core)](#4-shared-library)
5. [Models & Interfaces](#5-models--interfaces)
6. [Utilities](#6-utilities)
7. [Composables](#7-composables)
8. [Pinia Stores](#8-pinia-stores)
9. [API Layer](#9-api-layer)
10. [Host Application (Shell)](#10-host-application)
11. [Micro-Frontend Remotes](#11-micro-frontend-remotes)
12. [Module Federation Configuration](#12-module-federation-configuration)
13. [Routing & Navigation Guards](#13-routing--navigation-guards)
14. [State Management](#14-state-management)
15. [Styling — Tailwind CSS 4](#14b-styling--tailwind-css-4)
16. [Build & Development Workflow](#15-build--development-workflow)
17. [Environment Configuration](#16-environment-configuration)
18. [Production Deployment](#17-production-deployment)
19. [Testing](#18-testing)
20. [Key Design Decisions & Lessons](#19-key-design-decisions--lessons)

---

## 1. Project Overview

**NexCart** is a production-ready e-commerce platform built as a **micro-frontend architecture** using **Vue 3**, **TypeScript**, and **Vite Module Federation**.

### Recent implementation updates

- Cart quantity changes now work through the JSON-backed cart update route used by the frontend.
- Admin product edits persist stock values correctly from the current payload contract.
- Orders are now served through role-aware routes so customers view their own orders and admins manage the full order list.

### What it does:

- Full e-commerce functionality: browse products, add to cart, checkout, manage orders
- Authentication with role-based access (customer/admin)
- Admin panel for managing products and orders
- Wishlist functionality
- Responsive UI with loading states and error boundaries

### How it's built:

- **8 npm workspaces** in a monorepo
- **6 independent micro-frontends** + 1 host shell + 1 shared library
- Each MFE can be developed, built, and deployed independently
- Shared state (Pinia) works seamlessly across all MFEs via Module Federation

---

## 2. Architecture Deep Dive

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Single Page)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    HOST SHELL (Port 5000)                           │ │
│  │                                                                     │ │
│  │  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌─────────────┐  │ │
│  │  │  App.vue │  │ Vue Router   │  │ Pinia     │  │ Error       │  │ │
│  │  │  Layout  │  │ (lazy load)  │  │ (shared)  │  │ Boundaries  │  │ │
│  │  └──────────┘  └──────────────┘  └───────────┘  └─────────────┘  │ │
│  │                                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │              <RouterView> / <Suspense>                       │   │ │
│  │  │                                                              │   │ │
│  │  │   Route-based loading of remote components:                  │   │ │
│  │  │   /login      → mfeAuth/Login (from :5001)                  │   │ │
│  │  │   /products   → mfeProducts/ProductList (from :5002)         │   │ │
│  │  │   /cart       → mfeCart/Cart (from :5003)                    │   │ │
│  │  │   /checkout   → mfeCheckout/Checkout (from :5004)            │   │ │
│  │  │   /orders     → mfeOrders/OrderList (from :5005)             │   │ │
│  │  │   /admin      → mfeAdmin/AdminDashboard (from :5006)         │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                      MODULE FEDERATION LAYER                              │
│                                                                          │
│  Shared Scope: { vue: 3.4, pinia: 2.1, vue-router: 4.3 }               │
│  → All MFEs use the SAME instance (no duplication, state syncs)         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────┐│
│  │MFE-Auth │ │MFE-Prod │ │MFE-Cart │ │MFE-Chk  │ │MFE-Ord  │ │MFE-  ││
│  │  :5001  │ │  :5002  │ │  :5003  │ │  :5004  │ │  :5005  │ │Admin ││
│  │         │ │         │ │         │ │         │ │         │ │:5006 ││
│  │• Login  │ │•ProdList│ │• Cart   │ │•Checkout│ │•OrderLst│ │•Dashb││
│  │•Register│ │•ProdDtl │ │•Wishlist│ │         │ │•OrderDtl│ │•Prods││
│  │• Profile│ │         │ │         │ │         │ │         │ │•Ordrs││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └──────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Between MFEs

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                 │
│                                                                  │
│  User clicks "Add to Cart" in ProductList (mfe-products :5002)   │
│       │                                                          │
│       ▼                                                          │
│  cart.addToCart(product)  ← calls shared Pinia store             │
│       │                                                          │
│       ▼                                                          │
│  Cart store updates: items[], totalItems, totalPrice             │
│       │                                                          │
│       ├──────► Host nav badge updates (reactive)                 │
│       │        (cart.totalItems shown in header)                  │
│       │                                                          │
│       ├──────► Cart page reflects new item (mfe-cart :5003)      │
│       │                                                          │
│       └──────► Checkout shows updated total (mfe-checkout :5004) │
│                                                                  │
│  ALL from the SAME Pinia instance - no events, no postMessage!   │
└─────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

```
Browser URL: http://localhost:5000/products
       │
       ▼
┌──────────────────────┐
│ 1. Serve index.html  │  (from host's dist/ via vite preview)
│    from :5000        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 2. Load index.js     │  (tiny 1.2KB entry)
│    import('./boot')  │  ← ASYNC BOUNDARY
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 3. Load bootstrap.js │  (federation shared modules resolve here)
│    - createPinia()   │  ← registers shared scope
│    - createRouter()  │
│    - app.mount()     │  ← App.vue renders shell (nav, footer)
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 4. Router matches    │  path: '/products'
│    /products route   │  component: loadRemote(() => import('mfeProducts/ProductList'))
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐     ┌─────────────────────────────────┐
│ 5. Federation fetch  │────►│ GET http://localhost:5002/       │
│    remoteEntry.js    │     │     assets/remoteEntry.js        │
│    from :5002        │     │                                  │
└──────────┬───────────┘     │ Response: module manifest with   │
           │                  │ shared scope negotiation +       │
           │                  │ exposed component references     │
           │                  └─────────────────────────────────┘
           ▼
┌──────────────────────┐
│ 6. Shared scope      │  "I need vue, pinia..."
│    negotiation       │  → Already loaded by host ✓
│                      │  → Uses host's instances
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 7. Load exposed      │  ProductList.vue chunk downloaded
│    component chunk   │  from :5002/assets/xxx.js
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 8. Component renders │  Inside host's <RouterView>
│    using shared      │  useCartStore() → host's Pinia
│    Pinia/Vue         │  useRoute() → host's Router
└──────────────────────┘
```

---

## 3. Complete File Structure

```
vue-micro-frontends/
│
├── package.json                 ← Monorepo root (npm workspaces + scripts)
├── .env                         ← Shared env (VITE_API_URL) for all MFEs
├── tailwind.config.mjs          ← Root Tailwind config (shared preset, scans all MFEs)
├── postcss.config.mjs           ← Root PostCSS config (@tailwindcss/postcss)
├── .gitignore
├── .editorconfig
├── .prettierrc
├── eslint.config.js
├── vitest.config.ts
├── Dockerfile                   ← Multi-stage Docker build
├── docker-compose.yml
├── nginx.conf                   ← Production reverse proxy
├── nginx-mfe.conf               ← Per-MFE nginx config
├── .github/workflows/ci.yml     ← GitHub Actions CI/CD
│
├── shared/                      ← 📦 SHARED LIBRARY
│   ├── package.json
│   ├── tailwind.preset.js       ← Shared Tailwind design tokens (colors, fonts, shadows)
│   ├── src/
│   │   ├── index.ts            ← Barrel exports
│   │   ├── types.ts            ← TypeScript interfaces & models
│   │   ├── http.ts             ← HTTP client with auth
│   │   ├── api.ts              ← API service layer (auth, products, cart, orders, admin)
│   │   ├── composables/        ← Vue composables
│   │   │   ├── index.ts
│   │   │   ├── useApi.ts       ← Generic API call wrapper with loading/error
│   │   │   ├── useProducts.ts  ← Products fetching with filters & pagination
│   │   │   ├── useOrders.ts    ← Orders CRUD composable
│   │   │   ├── useCart.ts      ← Cart operations with formatting helpers
│   │   │   ├── useDebounce.ts  ← Reactive debounced ref
│   │   │   ├── useNotification.ts ← Toast notification composable
│   │   │   └── usePagination.ts← Pagination state management
│   │   ├── utils/              ← Utility functions
│   │   │   ├── index.ts
│   │   │   ├── currency.ts     ← formatCurrency, calculateTax, calculateDiscount
│   │   │   ├── date.ts         ← formatDate, formatRelativeTime, isToday
│   │   │   ├── validators.ts   ← Email, password, phone, address validation
│   │   │   ├── storage.ts      ← Type-safe localStorage/sessionStorage wrapper
│   │   │   ├── debounce.ts     ← debounce & throttle functions
│   │   │   └── string.ts       ← truncate, slugify, capitalize, pluralize
│   │   ├── stores/
│   │   │   ├── auth.ts         ← Auth store (login, register, profile)
│   │   │   ├── cart.ts         ← Cart & wishlist store
│   │   │   ├── products.ts     ← Products store (CRUD, filters, pagination)
│   │   │   ├── orders.ts       ← Orders store (fetch, create, update status)
│   │   │   └── notification.ts ← Toast notifications store
│   │   └── data/
│   │       └── products.ts     ← Mock data (12 products, 6 categories, 3 orders)
│   └── __tests__/
│       ├── auth.spec.ts        ← 10 auth store tests
│       ├── cart.spec.ts        ← 15 cart store tests
│       ├── products.spec.ts    ← 10 products store tests
│       ├── orders.spec.ts      ← 10 orders store tests
│       ├── notification.spec.ts← 9 notification store tests
│       ├── utils-currency.spec.ts  ← 10 currency util tests
│       ├── utils-date.spec.ts      ← 10 date util tests
│       ├── utils-validators.spec.ts ← 16 validator tests
│       ├── utils-string.spec.ts    ← 14 string util tests
│       ├── utils-debounce.spec.ts  ← 9 debounce/throttle tests
│       └── composables-pagination.spec.ts ← 10 pagination tests
│
├── host/                        ← 🏠 HOST SHELL (Consumer)
│   ├── package.json
│   ├── index.html
│   ├── env.d.ts                ← Type declarations for remote modules
│   ├── vite.config.ts          ← Federation consumer config
│   ├── .env.development        ← localhost MFE URLs
│   ├── .env.production         ← production MFE URLs
│   └── src/
│       ├── main.ts             ← Async boundary entry (3 lines)
│       ├── bootstrap.ts        ← Actual app init (Pinia, Router, mount)
│       ├── assets/
│       │   └── tailwind.css    ← Tailwind entry + component classes
│       ├── App.vue             ← Shell layout (header, nav, footer, RouterView)
│       ├── router/
│       │   ├── index.ts        ← All routes + guards + loadRemote()
│       │   └── types.ts        ← Route meta type augmentation
│       └── views/
│           ├── HomeView.vue    ← Landing page (hero, categories, featured)
│           ├── NotFound.vue    ← 404 page
│           └── RemoteError.vue ← Federation error fallback
│
├── mfe-auth/                    ← 🔐 AUTH MICRO-FRONTEND (Provider)
│   ├── package.json
│   ├── env.d.ts
│   ├── vite.config.ts          ← Exposes: Login, Register, Profile
│   └── src/
│       ├── App.vue             ← Standalone wrapper
│       ├── main.ts
│       ├── assets/
│       │   └── tailwind.css    ← Tailwind entry + component classes
│       └── components/
│           ├── Login.vue       ← Email/password form → auth.login()
│           ├── Register.vue    ← Registration form → auth.register()
│           └── Profile.vue     ← User info, edit, logout
│
├── mfe-products/                ← 🏷️ PRODUCTS MICRO-FRONTEND (Provider)
│   ├── package.json
│   ├── env.d.ts
│   ├── vite.config.ts          ← Exposes: ProductList, ProductDetail
│   └── src/
│       ├── App.vue
│       ├── main.ts
│       └── components/
│           ├── ProductList.vue  ← Grid with search, filter, sort, add-to-cart
│           └── ProductDetail.vue← Full product page, related items, buy now
│
├── mfe-cart/                    ← 🛒 CART MICRO-FRONTEND (Provider)
│   ├── package.json
│   ├── env.d.ts
│   ├── vite.config.ts          ← Exposes: Cart, Wishlist
│   └── src/
│       ├── App.vue
│       ├── main.ts
│       └── components/
│           ├── Cart.vue         ← Cart items, quantities, totals, checkout btn
│           └── Wishlist.vue     ← Saved items, move to cart
│
├── mfe-checkout/                ← 💳 CHECKOUT MICRO-FRONTEND (Provider)
│   ├── package.json
│   ├── env.d.ts
│   ├── vite.config.ts          ← Exposes: Checkout
│   └── src/
│       ├── App.vue
│       ├── main.ts
│       └── components/
│           └── Checkout.vue     ← 3-step wizard (shipping → payment → review)
│
├── mfe-orders/                  ← 📦 ORDERS MICRO-FRONTEND (Provider)
│   ├── package.json
│   ├── env.d.ts
│   ├── vite.config.ts          ← Exposes: OrderList, OrderDetail
│   └── src/
│       ├── App.vue
│       ├── main.ts
│       └── components/
│           ├── OrderList.vue    ← All orders with status badges
│           └── OrderDetail.vue  ← Status tracker, items, shipping info
│
└── mfe-admin/                   ← ⚙️ ADMIN MICRO-FRONTEND (Provider)
    ├── package.json
    ├── env.d.ts
    ├── vite.config.ts           ← Exposes: AdminDashboard, AdminProducts, AdminOrders
    └── src/
        ├── App.vue
        ├── main.ts
        └── components/
            ├── AdminDashboard.vue ← Stats cards, recent orders, quick actions
            ├── AdminProducts.vue  ← Product table, CRUD operations, modal
            └── AdminOrders.vue    ← Order management, status updates

```

---

## 4. Shared Library

### Purpose

The `shared` package is the backbone - it contains everything that multiple MFEs need access to: types, stores, composables, utilities, and the API layer.

### Barrel Export (`shared/src/index.ts`)

```typescript
// Models & Types
export * from "./types";

// Stores
export * from "./stores/auth";
export * from "./stores/cart";
export * from "./stores/products";
export * from "./stores/orders";
export * from "./stores/notification";

// Composables
export * from "./composables";

// Utilities
export * from "./utils";

// API Layer
export * from "./http";
export * from "./api";

// Mock Data
export * from "./data/products";
```

---

## 5. Models & Interfaces

### `shared/src/types.ts` - Complete Type System

```typescript
// ─── Product Models ───────────────────────────────
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  sku: string;
}
export interface ProductCreateInput {
  /* Omit<Product, 'id'> fields */
}
export type ProductUpdateInput = Partial<ProductCreateInput>;
export interface ProductFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
}
export type ProductSortOption =
  | "price-asc"
  | "price-desc"
  | "rating"
  | "name"
  | "newest";

// ─── Cart Models ──────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}
export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

// ─── User & Auth Models ───────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}
export type UserRole = "customer" | "admin";
export interface UserRegistrationInput {
  name: string;
  email: string;
  password: string;
}
export interface UserLoginInput {
  email: string;
  password: string;
}
export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// ─── Order Models ─────────────────────────────────
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  shippingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
}
export interface OrderCreateInput {
  shippingAddress: Address;
  paymentMethod: string;
}
export interface OrderStatusUpdate {
  status: OrderStatus;
  trackingNumber?: string;
}

// ─── Address Models ───────────────────────────────
export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

// ─── Category Models ──────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

// ─── API Response Models ──────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
export interface ApiErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

// ─── Admin Models ─────────────────────────────────
export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  revenueByMonth: RevenueData[];
  ordersByStatus: OrderStatusCount[];
}
export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}
export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

// ─── Notification Models ──────────────────────────
export type NotificationType = "success" | "error" | "warning" | "info";
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

// ─── UI State Models ──────────────────────────────
export interface ModalState {
  isOpen: boolean;
  component?: string;
  props?: Record<string, unknown>;
}
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

// ─── Pagination & Query Models ────────────────────
export interface PaginationParams {
  page: number;
  limit: number;
}
export interface SortParams {
  field: string;
  order: "asc" | "desc";
}
export interface QueryParams extends PaginationParams {
  sort?: SortParams;
  filter?: Record<string, unknown>;
}
```

---

## 6. Utilities

### `shared/src/utils/` - Reusable Utility Functions

| File            | Functions                                                                                                                                     | Purpose                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `currency.ts`   | `formatCurrency()`, `formatCompactCurrency()`, `calculateDiscount()`, `calculateTax()`                                                        | Money formatting & calculations                |
| `date.ts`       | `formatDate()`, `formatShortDate()`, `formatRelativeTime()`, `formatDateTime()`, `isToday()`                                                  | Date formatting & relative time                |
| `validators.ts` | `validateEmail()`, `validatePassword()`, `validateRequired()`, `validatePhone()`, `validateZipCode()`, `validatePrice()`, `validateAddress()` | Form validation with error messages            |
| `storage.ts`    | `storage.get()`, `storage.set()`, `storage.remove()`, `sessionStore.*`, `STORAGE_KEYS`                                                        | Type-safe localStorage/sessionStorage wrappers |
| `debounce.ts`   | `debounce()`, `throttle()`                                                                                                                    | Function call limiters                         |
| `string.ts`     | `truncate()`, `slugify()`, `capitalize()`, `slugToTitle()`, `generateId()`, `formatNumber()`, `pluralize()`                                   | String manipulation                            |

### Example Usage:

```typescript
import {
  formatCurrency,
  formatRelativeTime,
  validateEmail,
  debounce,
} from "shared";

// In a component:
const price = formatCurrency(29.99); // "$29.99"
const when = formatRelativeTime(order.createdAt); // "3 hours ago"
const { valid, message } = validateEmail(email); // { valid: false, message: "Invalid email format" }

// Debounced search:
const debouncedSearch = debounce((query: string) => {
  productsApi.getAll({ search: query });
}, 400);
```

---

## 7. Composables

### `shared/src/composables/` - Vue 3 Composition API Hooks

| Composable                | Purpose                                                   | Returns                                                                          |
| ------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `useApi(apiFn)`           | Generic API call wrapper with loading/error state         | `{ data, loading, error, execute, reset }`                                       |
| `useProducts(options?)`   | Products fetching with search, filter, sort, pagination   | `{ products, categories, loading, searchQuery, sortBy, fetchProducts, ... }`     |
| `useOrders()`             | Orders CRUD with status management                        | `{ orders, currentOrder, loading, fetchOrders, createOrder, updateOrderStatus }` |
| `useCart()`               | Cart operations + formatted totals + shipping calculation | `{ items, formattedSubtotal, hasFreeShipping, addItem, toggleWishlist, ... }`    |
| `useDebounce(ref, delay)` | Reactive debounced value                                  | Debounced `Ref<T>`                                                               |
| `useNotification()`       | Toast notification helper                                 | `{ success, error, warning, info, notifications }`                               |
| `usePagination(options?)` | Pagination state & navigation                             | `{ page, totalPages, hasNextPage, pageRange, nextPage, goToPage, ... }`          |

### Example: `useProducts` in a Component

```vue
<script setup lang="ts">
import { useProducts } from "shared";

const {
  products,
  categories,
  loading,
  error,
  searchQuery,
  selectedCategory,
  sortBy,
  page,
  totalPages,
  hasMore,
} = useProducts({ immediate: true, limit: 12 });
</script>

<template>
  <input v-model="searchQuery" placeholder="Search products..." />
  <select v-model="selectedCategory">
    <option value="">All</option>
    <option v-for="cat in categories" :value="cat.slug">{{ cat.name }}</option>
  </select>
  <div v-if="loading">Loading...</div>
  <ProductGrid :products="products" />
</template>
```

### Example: `useApi` Generic Wrapper

```typescript
import { useApi } from "shared";
import { adminApi } from "shared";

// In Admin Dashboard:
const { data: stats, loading, error, execute } = useApi(adminApi.getStats);
onMounted(() => execute());
```

---

## 8. Pinia Stores

### Store Architecture (5 Stores)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PINIA STORES (Shared Scope)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth Store  │  │  Cart Store  │  │  Products Store      │  │
│  │              │  │              │  │                       │  │
│  │ • user       │  │ • items[]    │  │ • products[]          │  │
│  │ • token      │  │ • wishlist[] │  │ • categories[]        │  │
│  │ • loading    │  │ • totalItems │  │ • selectedProduct     │  │
│  │ • error      │  │ • totalPrice │  │ • searchQuery         │  │
│  │              │  │ • shipping   │  │ • selectedCategory    │  │
│  │ login()      │  │ • grandTotal │  │ • sortBy              │  │
│  │ register()   │  │              │  │                       │  │
│  │ logout()     │  │ addToCart()  │  │ fetchProducts()       │  │
│  │ updateProf() │  │ removeFrom() │  │ createProduct()       │  │
│  │ fetchUser()  │  │ updateQty()  │  │ updateProduct()       │  │
│  │              │  │ clearCart()  │  │ deleteProduct()       │  │
│  │              │  │ addWishlist()│  │ resetFilters()        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────────────┐  ┌─────────────────────────────────┐  │
│  │  Orders Store        │  │  Notification Store             │  │
│  │                      │  │                                  │  │
│  │ • orders[]           │  │ • notifications[]                │  │
│  │ • currentOrder       │  │                                  │  │
│  │ • statusFilter       │  │ add({ type, title, message })    │  │
│  │ • filteredOrders     │  │ remove(id)                       │  │
│  │ • pendingOrders      │  │ clearAll()                       │  │
│  │                      │  │                                  │  │
│  │ fetchOrders()        │  │ Auto-removes after duration      │  │
│  │ fetchOrderById()     │  │                                  │  │
│  │ createOrder()        │  │                                  │  │
│  │ updateStatus()       │  │                                  │  │
│  └──────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### `useAuthStore` - Authentication

```typescript
const auth = useAuthStore();

// State: user, token, loading, error
// Computed: isAuthenticated, isAdmin
// Actions: login(email, pass), register(name, email, pass), logout(), updateProfile(updates), fetchUser()
```

### `useCartStore` - Shopping Cart & Wishlist

```typescript
const cart = useCartStore();

// State: items[], wishlist[], loading, error
// Computed: totalItems, totalPrice, shipping, grandTotal
// Actions: addToCart(product, qty), removeFromCart(id), updateQuantity(id, qty), clearCart()
//          addToWishlist(product), removeFromWishlist(id), isInWishlist(id), isInCart(id)
//          fetchCart(), fetchWishlist() ← API sync for logged-in users
```

### `useProductsStore` - Product Catalog (CRUD)

```typescript
const products = useProductsStore();

// State: products[], categories[], selectedProduct, loading, error, total, page, totalPages
// Filters: searchQuery, selectedCategory, sortBy
// Computed: hasProducts, hasMore
// Actions: fetchProducts(), fetchCategories(), fetchProductById(id)
//          createProduct(data), updateProduct(id, data), deleteProduct(id), resetFilters()
```

### `useOrdersStore` - Order Management

```typescript
const orders = useOrdersStore();

// State: orders[], currentOrder, loading, error, statusFilter
// Computed: filteredOrders, orderCount, pendingOrders
// Actions: fetchOrders(status?), fetchOrderById(id), createOrder(payload), updateStatus(id, status, tracking?)
```

### `useNotificationStore` - Toast Notifications

```typescript
const notifications = useNotificationStore();

// State: notifications[]
// Actions: add({ type, title, message, duration }), remove(id), clearAll()
// Auto-removes notifications after duration (default 5000ms)
```

---

## 9. API Layer

### Architecture: Domain-Scoped API Composables

Each micro-frontend owns its domain API calls as **axios-based composables**. The shared library only retains internal APIs used by cross-cutting stores (auth, cart).

### `shared/src/api.ts` - Internal APIs (used by shared stores only)

```typescript
// Uses axios with baseURL from VITE_API_URL || 'http://localhost:3001'
// Request interceptor: auto-injects JWT Bearer token
// Response interceptor: normalized error { status, message }

export const authApi = {
  login(email, password): Promise<LoginResponse>
  register(name, email, password): Promise<LoginResponse>
  getMe(): Promise<User>
  updateProfile(updates): Promise<User>
}

export const cartApi = {
  get(): Promise<CartApiItem[]>
  addItem(productId, quantity): Promise<CartApiItem[]>
  updateQuantity(productId, quantity): Promise<CartApiItem[]>
  removeItem(productId): Promise<void>
  clear(): Promise<void>
}

export const wishlistApi = {
  get(): Promise<Product[]>
  add(productId): Promise<Product[]>
  remove(productId): Promise<void>
}
```

### Per-MFE API Composables Pattern

Each MFE has `src/composables/http.ts` (configured axios instance) and domain composables:

```typescript
// mfe-products/src/composables/useProductsApi.ts
export function useProductsApi() {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function getAll(query?) {
    /* http.get('/api/products', { params }) */
  }
  async function getById(id) {
    /* http.get(`/api/products/${id}`) */
  }

  return { products, loading, error, total, totalPages, getAll, getById };
}
```

| MFE          | Composables                                                    |
| ------------ | -------------------------------------------------------------- |
| mfe-products | `useProductsApi`, `useCategoriesApi`                           |
| mfe-orders   | `useOrdersApi`                                                 |
| mfe-checkout | `useCheckoutApi`                                               |
| mfe-admin    | `useAdminProductsApi`, `useAdminOrdersApi`, `useAdminStatsApi` |
| host         | `useHomeApi`                                                   |

---

## 10. Host Application

### Entry Point Pattern (Async Boundary)

```
host/src/main.ts (3 lines):
┌─────────────────────────────────────────────────────────────┐
│  // Async boundary: allows federation shared modules to      │
│  // resolve via top-level await without blocking page load   │
│  import('./bootstrap')                                       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼ (dynamic import)
host/src/bootstrap.ts:
┌─────────────────────────────────────────────────────────────┐
│  import { createApp } from 'vue'                             │
│  import { createPinia } from 'pinia'                         │
│  import App from './App.vue'                                 │
│  import router from './router'                               │
│                                                              │
│  const app = createApp(App)                                  │
│  app.config.errorHandler = (err, instance, info) => { ... }  │
│  app.use(createPinia())                                      │
│  app.use(router)                                             │
│  app.mount('#app')                                           │
└─────────────────────────────────────────────────────────────┘
```

### App.vue - Shell Layout

```
┌───────────────────────────────────────────────────────────┐
│ HEADER (sticky, dark background #1a1a2e)                   │
│ ┌─────────┐ ┌───────────────────┐ ┌───────────────────┐  │
│ │🛒NexCart│ │Products│Orders│Admin│ │❤️ 🛒(badge) 👤 Logout│  │
│ └─────────┘ └───────────────────┘ └───────────────────┘  │
├───────────────────────────────────────────────────────────┤
│ MAIN (max-width: 1400px, centered)                        │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ <RouterView v-slot="{ Component }">                  │   │
│ │   <Suspense>                                         │   │
│ │     <component :is="Component" />   ← Remote loads   │   │
│ │     #fallback: Loading spinner       ← While loading │   │
│ │   </Suspense>                                        │   │
│ │ </RouterView>                                        │   │
│ └─────────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────────┤
│ FOOTER (dark, 3-column grid)                              │
│ ┌──────────┐  ┌──────────────┐  ┌─────────────┐         │
│ │ NexCart  │  │ Quick Links  │  │ Account     │         │
│ │ desc...  │  │ Products     │  │ Profile     │         │
│ │          │  │ Cart         │  │ Wishlist    │         │
│ │          │  │ Orders       │  │             │         │
│ └──────────┘  └──────────────┘  └─────────────┘         │
│ © 2024 NexCart. Built with Vue 3 + Module Federation.    │
└───────────────────────────────────────────────────────────┘
```

### Type Declarations (`host/env.d.ts`)

```typescript
// Tells TypeScript about remote modules that don't exist locally
declare module "mfeAuth/*" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
// ... same for mfeProducts/*, mfeCart/*, etc.
```

---

## 11. Micro-Frontend Remotes

### Each MFE has the same structure:

```
mfe-xxx/
├── package.json          ← scripts: dev, build, preview
├── env.d.ts              ← Vue SFC type declarations
├── vite.config.ts        ← Federation provider config
└── src/
    ├── App.vue           ← Standalone wrapper (for isolated development)
    ├── main.ts           ← Standalone entry (createApp, mount)
    └── components/
        └── *.vue         ← EXPOSED components (consumed by host)
```

### What Each MFE Exposes:

| MFE              | Port | Exposed Components                         | Key Features                                                                               |
| ---------------- | ---- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **mfe-auth**     | 5001 | Login, Register, Profile                   | Form validation, role-based (admin via email), avatar via dicebear API                     |
| **mfe-products** | 5002 | ProductList, ProductDetail                 | Search, filter by category, sort (price/rating/name), add to cart, related products        |
| **mfe-cart**     | 5003 | Cart, Wishlist                             | Quantity controls, remove items, move wishlist→cart, price totals, free shipping threshold |
| **mfe-checkout** | 5004 | Checkout                                   | 3-step wizard (shipping→payment→review), multiple payment methods, order confirmation      |
| **mfe-orders**   | 5005 | OrderList, OrderDetail                     | Status badges (color-coded), order tracker (progress dots), tracking number                |
| **mfe-admin**    | 5006 | AdminDashboard, AdminProducts, AdminOrders | Stats cards with trends, product CRUD table with modal, order status management            |

---

## 12. Module Federation Configuration

### Host (Consumer) - `host/vite.config.ts`

```typescript
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      federation({
        name: "host",
        remotes: {
          mfeAuth:
            env.VITE_MFE_AUTH_URL ||
            "http://localhost:5001/assets/remoteEntry.js",
          mfeProducts:
            env.VITE_MFE_PRODUCTS_URL ||
            "http://localhost:5002/assets/remoteEntry.js",
          mfeCart:
            env.VITE_MFE_CART_URL ||
            "http://localhost:5003/assets/remoteEntry.js",
          mfeCheckout:
            env.VITE_MFE_CHECKOUT_URL ||
            "http://localhost:5004/assets/remoteEntry.js",
          mfeOrders:
            env.VITE_MFE_ORDERS_URL ||
            "http://localhost:5005/assets/remoteEntry.js",
          mfeAdmin:
            env.VITE_MFE_ADMIN_URL ||
            "http://localhost:5006/assets/remoteEntry.js",
        },
        shared: ["vue", "vue-router", "pinia"], // CRITICAL
      }),
    ],
    build: {
      modulePreload: false,
      target: "esnext",
      minify: "terser",
      cssCodeSplit: false,
    },
  };
});
```

### Remote (Provider) - Example `mfe-auth/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "mfeAuth",
      filename: "remoteEntry.js", // The manifest file
      exposes: {
        // What this MFE shares
        "./Login": "./src/components/Login.vue",
        "./Register": "./src/components/Register.vue",
        "./Profile": "./src/components/Profile.vue",
      },
      shared: ["vue", "vue-router", "pinia"], // Use host's instances
    }),
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: "terser",
    cssCodeSplit: false,
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true, // Required for cross-origin federation
  },
});
```

---

## 13. Routing & Navigation Guards

### Route Configuration (`host/src/router/index.ts`)

```typescript
// Error boundary wrapper - if remote fails, show error page
function loadRemote(loader: () => Promise<any>) {
  return () => loader().catch(() => import("../views/RemoteError.vue"));
}

const routes: RouteRecordRaw[] = [
  // LOCAL route (bundled with host)
  { path: "/", name: "home", component: HomeView },

  // REMOTE routes (loaded via federation on navigation)
  {
    path: "/login",
    component: loadRemote(() => import("mfeAuth/Login")),
    meta: { guest: true },
  },
  {
    path: "/register",
    component: loadRemote(() => import("mfeAuth/Register")),
    meta: { guest: true },
  },
  {
    path: "/profile",
    component: loadRemote(() => import("mfeAuth/Profile")),
    meta: { requiresAuth: true },
  },
  {
    path: "/products",
    component: loadRemote(() => import("mfeProducts/ProductList")),
  },
  {
    path: "/products/:id",
    component: loadRemote(() => import("mfeProducts/ProductDetail")),
  },
  { path: "/cart", component: loadRemote(() => import("mfeCart/Cart")) },
  {
    path: "/wishlist",
    component: loadRemote(() => import("mfeCart/Wishlist")),
  },
  {
    path: "/checkout",
    component: loadRemote(() => import("mfeCheckout/Checkout")),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    component: loadRemote(() => import("mfeOrders/OrderList")),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders/:id",
    component: loadRemote(() => import("mfeOrders/OrderDetail")),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    component: loadRemote(() => import("mfeAdmin/AdminDashboard")),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/products",
    component: loadRemote(() => import("mfeAdmin/AdminProducts")),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/orders",
    component: loadRemote(() => import("mfeAdmin/AdminOrders")),
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // CATCH-ALL (local)
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../views/NotFound.vue"),
  },
];
```

### Navigation Guards

```typescript
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } }); // Save intended URL
  } else if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ name: "home" }); // Non-admins can't access admin pages
  } else if (to.meta.guest && auth.isAuthenticated) {
    next({ name: "home" }); // Logged-in users can't see login/register
  } else {
    next(); // Allow navigation
  }
});
```

---

## 14. State Management

### How Pinia Works Across MFEs

```
┌─────────────────────────────────────────────────────────────┐
│  1. Host creates Pinia instance in bootstrap.ts:             │
│     app.use(createPinia())                                   │
│                                                              │
│  2. Federation shared scope makes this THE pinia instance    │
│                                                              │
│  3. When mfe-auth's Login.vue calls useAuthStore():          │
│     - It imports defineStore from 'pinia'                    │
│     - Federation resolves to HOST's pinia (shared scope)     │
│     - Store gets registered on HOST's Pinia instance         │
│     - State is reactive across ALL components everywhere     │
│                                                              │
│  4. When host's App.vue reads auth.isAuthenticated:          │
│     - Same store instance                                    │
│     - Reactive updates propagate instantly                   │
│     - Login in mfe-auth → nav updates in host               │
└─────────────────────────────────────────────────────────────┘
```

---

## 14b. Styling — Tailwind CSS 4

### Overview

All components use **Tailwind CSS v4** with utility-first classes. No scoped CSS — styling is done entirely via Tailwind utilities and custom component classes defined in a shared CSS layer.

### Architecture

```
tailwind.config.mjs                ← Root config (imports shared preset, scans all MFEs)
postcss.config.mjs                 ← Root PostCSS config (@tailwindcss/postcss)
shared/tailwind.preset.js          ← Shared design tokens (colors, fonts, shadows)
{each-mfe}/src/assets/tailwind.css ← Tailwind entry point + component classes
```

### Color Palette

| Token     | Color   | Hex       | Usage                      |
| --------- | ------- | --------- | -------------------------- |
| `primary` | Indigo  | `#4F46E5` | Buttons, links, nav        |
| `accent`  | Emerald | `#10B981` | CTA, success, add-to-cart  |
| `danger`  | Rose    | `#F43F5E` | Errors, delete, warnings   |
| `neutral` | Slate   | —         | Text, borders, backgrounds |

### Shared Preset (`shared/tailwind.preset.js`)

Defines consistent design tokens across all MFEs:

- Custom colors: `primary-50..950`, `accent-50..900`, `danger-50..900`
- Font family: Inter, system-ui, sans-serif
- Box shadows: `shadow-card`, `shadow-elevated`

### Root Configuration (centralized, not per-MFE)

**`postcss.config.mjs`** (workspace root):

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**`tailwind.config.mjs`** (workspace root):

```js
import preset from "./shared/tailwind.preset.js";

export default {
  presets: [preset],
  content: [
    "./host/index.html",
    "./host/src/**/*.{vue,ts,js}",
    "./mfe-*/index.html",
    "./mfe-*/src/**/*.{vue,ts,js}",
  ],
};
```

**`src/assets/tailwind.css`** (in each MFE):

```css
@import "tailwindcss";
@config "../../../tailwind.config.mjs";

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 font-sans antialiased;
  }
}

@layer components {
  .btn {
    /* base button styles */
  }
  .btn-primary {
    /* indigo filled */
  }
  .btn-accent {
    /* emerald filled */
  }
  .btn-danger {
    /* rose filled */
  }
  .btn-outline {
    /* bordered */
  }
  .btn-ghost {
    /* transparent */
  }
  .input {
    /* form input */
  }
  .card {
    /* white rounded shadow */
  }
  .badge {
    /* small pill label */
  }
}
```

### Component Classes

| Class          | Description                                             |
| -------------- | ------------------------------------------------------- |
| `.btn`         | Base: inline-flex, rounded-lg, font-medium, transitions |
| `.btn-primary` | Indigo bg, white text, hover/focus states               |
| `.btn-accent`  | Emerald bg, white text, CTA style                       |
| `.btn-danger`  | Rose bg, white text, destructive actions                |
| `.btn-outline` | Bordered, slate text, subtle hover                      |
| `.btn-ghost`   | Transparent, text only, hover bg                        |
| `.input`       | Full-width, bordered, focus ring                        |
| `.card`        | White bg, rounded-xl, shadow-card, p-6                  |
| `.badge`       | Inline pill, rounded-full, xs text                      |

### Key Dependencies

```json
{
  "tailwindcss": "^4.3.0",
  "@tailwindcss/postcss": "^4.x",
  "postcss": "^8.x",
  "autoprefixer": "^10.x"
}
```

---

## 15. Build & Development Workflow

### npm Scripts (root `package.json`)

```json
{
  "scripts": {
    "dev": "npm run build:remotes && concurrently [all preview servers]",
    "build:remotes": "concurrently [build all 6 MFEs in parallel]",
    "build": "npm run build --workspaces",
    "lint": "eslint . --ext .ts,.vue",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Development Commands

```bash
# Full development start (builds + serves everything)
npm run dev

# Or manual step-by-step:
npm run build:remotes                           # Build all 6 MFEs
cd host && npx vite build --mode development    # Build host with localhost URLs
npx concurrently "npm run preview --workspace=mfe-auth" ... "npm run preview --workspace=host"
```

---

## 16. Environment Configuration

### `.env.development` (localhost URLs for local dev)

```env
VITE_API_URL=http://localhost:3001
VITE_MFE_AUTH_URL=http://localhost:5001/assets/remoteEntry.js
VITE_MFE_PRODUCTS_URL=http://localhost:5002/assets/remoteEntry.js
VITE_MFE_CART_URL=http://localhost:5003/assets/remoteEntry.js
VITE_MFE_CHECKOUT_URL=http://localhost:5004/assets/remoteEntry.js
VITE_MFE_ORDERS_URL=http://localhost:5005/assets/remoteEntry.js
VITE_MFE_ADMIN_URL=http://localhost:5006/assets/remoteEntry.js
```

### `.env.production` (full URLs for local preview / direct MFE access)

```env
VITE_API_URL=http://localhost:3001
VITE_MFE_AUTH_URL=http://localhost:5001/assets/remoteEntry.js
VITE_MFE_PRODUCTS_URL=http://localhost:5002/assets/remoteEntry.js
VITE_MFE_CART_URL=http://localhost:5003/assets/remoteEntry.js
VITE_MFE_CHECKOUT_URL=http://localhost:5004/assets/remoteEntry.js
VITE_MFE_ORDERS_URL=http://localhost:5005/assets/remoteEntry.js
VITE_MFE_ADMIN_URL=http://localhost:5006/assets/remoteEntry.js
```

> **Note:** For a real production deployment behind nginx reverse proxy, change to relative paths:
> `VITE_MFE_AUTH_URL=/mfe-auth/assets/remoteEntry.js` etc.

````

---

## 17. Production Deployment

### Dockerfile (Multi-stage)

```dockerfile
ARG APP_NAME=host

# Stage 1: Build
FROM node:20-alpine AS builder
ARG APP_NAME
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY ${APP_NAME}/package.json ./${APP_NAME}/
RUN npm ci --workspace=shared --workspace=${APP_NAME}
COPY shared/ ./shared/
COPY ${APP_NAME}/ ./${APP_NAME}/
RUN npm run build --workspace=${APP_NAME}

# Stage 2: Serve
FROM nginx:alpine AS production
ARG APP_NAME
COPY --from=builder /app/${APP_NAME}/dist /usr/share/nginx/html
COPY nginx-mfe.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
````

### Production Architecture

```
┌─────────────────────────────────────────────────┐
│              Nginx Reverse Proxy                  │
│                                                  │
│  /              → serves host/dist/index.html    │
│  /assets/*      → serves host/dist/assets/       │
│  /mfe-auth/*    → proxy to mfe-auth container    │
│  /mfe-products/*→ proxy to mfe-products container│
│  /mfe-cart/*    → proxy to mfe-cart container    │
│  /mfe-checkout/*→ proxy to mfe-checkout container│
│  /mfe-orders/*  → proxy to mfe-orders container  │
│  /mfe-admin/*   → proxy to mfe-admin container   │
│                                                  │
│  All static files - NO Node.js runtime needed!   │
└─────────────────────────────────────────────────┘
```

---

## 18. Testing

### Unit Tests with Vitest

```typescript
// shared/__tests__/cart.spec.ts
describe("Cart Store", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("adds item to cart");
  it("increments quantity when adding same item");
  it("removes item from cart");
  it("calculates total price correctly");
  it("provides free shipping over $50");
  it("charges shipping under $50");
  it("manages wishlist");
  // ... 10 tests total
});

// shared/__tests__/auth.spec.ts
describe("Auth Store", () => {
  it("starts unauthenticated");
  it("logs in a user");
  it("identifies admin users");
  it("logs out a user");
  it("registers a new user");
  // ... 6 tests total
});
```

### Running Tests

```bash
npm test              # Watch mode
npm run test:coverage # Coverage report
```

---

## 19. Key Design Decisions & Lessons

### Why Module Federation (not alternatives)?

| Decision                            | Reason                                                            |
| ----------------------------------- | ----------------------------------------------------------------- |
| Module Federation over Single-SPA   | Same framework (Vue only), simpler, built-in shared scope         |
| Module Federation over iframes      | Need shared state (Pinia), better UX (no iframe scrolling issues) |
| Module Federation over npm packages | Independent deployment - update auth without rebuilding host      |
| @originjs/vite-plugin-federation    | Vite ecosystem - faster builds, better DX than webpack            |

### Critical Patterns Discovered

| Pattern                                                               | Why                                                                                                                                                  |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Async Boundary** (`main.ts` → `import('./bootstrap')`)              | Federation shared modules inject top-level `await`. Without async boundary, the page stays blank because the entry module never finishes evaluating. |
| **`shared: ['vue', 'vue-router', 'pinia']` on BOTH host and remotes** | Without it, each MFE gets its own Vue/Pinia instance → `_s` undefined error when calling stores.                                                     |
| **`vite build` + `vite preview` (NOT `vite dev`)**                    | `vite dev` doesn't generate `remoteEntry.js`. Federation needs compiled bundles.                                                                     |
| **`--mode development` for local host builds**                        | Default build uses `.env.production` (nginx paths). Must explicitly use development mode for localhost URLs.                                         |
| **No `manualChunks` in host**                                         | Custom chunk splitting conflicts with federation's auto-generated chunks (`__federation_shared_*`).                                                  |
| **`cors: true` on all preview servers**                               | Host on :5000 fetches JS from :5001-5006. CORS headers required for cross-origin module loading.                                                     |

### Dependency Versions (Verified Working)

```json
{
  "vue": "^3.4.0",
  "vue-router": "^4.3.0",
  "pinia": "^2.1.7",
  "vite": "^5.4.0",
  "@originjs/vite-plugin-federation": "^1.3.5",
  "@vitejs/plugin-vue": "^5.0.0",
  "tailwindcss": "^4.3.0",
  "@tailwindcss/postcss": "^4.3.0",
  "terser": "^5.48.0",
  "typescript": "^5.4.0"
}
```
