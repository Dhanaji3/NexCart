# Per-file Documentation Report

This document provides concise, per-file descriptions for the main files and directories in the repository. Use links below to navigate to each area for deeper reading.

**Scope:** root-level files, `backend/backend-springboot`, `frontend` (host + MFEs), `shared`, `database`, `k8s`, and `project-docs`.

---

**Root files**

- `README.md`: Primary project overview, architecture, stack, and run instructions.
- `CHANGELOG.md`: Recent changes summary (new in repo: documents DB fix and UI updates).
- `docker-compose.yml`: Compose setup (services for DB, backend, and frontend stack for local testing).
- `CHANGELOG.md`: Changelog for notable updates.

**backend/**

- `Dockerfile`: Docker image build for the legacy/Express backend (if used).
- `nginx.conf`: Nginx proxy config for backend container.

**backend/api-server/** (Express.js legacy API)

- `server.js`: Main Express server with JWT auth, product/cart/order routes (legacy, used during migration).
- `package.json`: NPM scripts and dependencies for the Express API.
- `db.json`: Local JSON data file used by the Express server for quick development/testing.

**backend/backend-springboot/** (Spring Boot backend)

- `pom.xml` / `build.gradle` / `gradlew.bat`: Build system files (Maven/Gradle support present). Use `gradle clean build` or `mvn package` as configured.
- `src/main/java/com/ecommerce/ECommerceBackendApplication.java`: Spring Boot application entry point.
- `src/main/java/com/ecommerce/controller/`:
  - `AuthController.java`: `POST /api/auth/register` and `POST /api/auth/login` handlers.
  - `ProductController.java`: Product listing and detail endpoints.
  - `CartController.java`: Cart management endpoints.
  - `OrderController.java`: Customer order creation and retrieval endpoints.
  - `AdminController.java`: Admin endpoints (product and order management) including `PUT /api/admin/orders/{id}/status`.
  - `HealthController.java`: `/api/health` endpoint for liveness checks.
- `src/main/java/com/ecommerce/service/OrderService.java`: Business logic for order creation and status updates (persists `trackingNumber` when provided).
- `src/main/java/com/ecommerce/model/Order.java`: JPA entity defining `Order` and `OrderStatus` enum. Note: enum values must match DB CHECK constraints.
- `src/main/resources/application*.yml`: Environment-specific Spring configuration.
- `update_status_check.sql`: SQL script that alters the `orders_status_check` to include `PROCESSING`; should be converted to a migration (Flyway/Liquibase) before production deployment.

**database/**

- `docker-compose.yml`: Database-only compose used for local DB instance.

**frontend/**

- `package.json`: Root workspace scripts (`npm run dev`, `build`, workspaces). Use `npm run dev` to start host + remotes in development (may require environment variables and concurrent process management).
- `eslintrc` / `vitest.config.ts`: Linting and test config for frontend.

**frontend/host/**

- `vite.config.ts`: Host Vite config and Module Federation consumer setup.
- `src/bootstrap.ts`: Runtime bootstrap to load remote MFEs lazily.
- `src/router/index.ts`: Router configuration and `loadRemote()` helper for runtime remote loading.
- `src/main.ts`: App entry — installs Pinia, Router and mounts host.

**frontend/shared/**

- `package.json`: Shared package config used by all MFEs.
- `src/index.ts`: Barrel export for shared types, composables, stores.
- `src/api.ts`: Shared `axios` instance(s) and API helpers (`authApi`, `cartApi`, `wishlistApi`). Contains response interceptor to normalize errors.
- `src/stores/auth.ts`: `useAuthStore` Pinia store (token persistence and user fetch).
- `src/stores/cart.ts`: Cart store with mutation helpers and persistence.
- `src/composables/`: Reusable composition hooks (API wrappers, debounce, pagination, notifications).

**frontend/mfe-orders/**

- `vite.config.ts`: Exposes `OrderList` and `OrderDetail` components to the host.
- `src/components/OrderDetail.vue`: Order details and visual stepper — recently adjusted connector position and progress overlay logic.
- `src/composables/useOrdersApi.ts`: Client API wrapper for order retrieval.

**frontend/mfe-admin/**

- `src/composables/useAdminOrdersApi.ts`: Admin API wrapper; `updateStatus(id, status, trackingNumber?)` sends `PUT /api/admin/orders/{id}/status` using a `null` body with query params (status, trackingNumber).

**Other MFEs** (auth, products, cart, checkout, etc.)

- Each MFE follows similar structure: `vite.config.ts`, `index.html`, `package.json`, `src/main.ts`, `src/components/` and `src/composables/`.

**k8s/**

- `00-common.yaml`, `01-database.yaml`, `02-backend.yaml`, `03-frontend.yaml`: Kubernetes manifests for cluster deployments. Apply in order for correct dependency setup.

**project-docs/**

- `README.md`: Index of documentation and links to sub-docs.
- `backend/backend-springboot/MIGRATION_GUIDE.md`: Step-by-step migration plan from Express to Spring Boot (phased approach, dual-read patterns).
- `root-docs/LOCAL_DEVELOPMENT_SETUP.md`: Local environment setup instructions (ports, env vars, running commands).

---

If you want, I can now:

- Expand this into a true per-file listing (include every source file with a short summary). This will take longer but I can auto-generate it by scanning the repo.
- Create a Flyway migration file from `backend/backend-springboot/update_status_check.sql` and add it to `src/main/resources/db/migration`.

Select an option or tell me to proceed with a full automated scan and I'll generate a more exhaustive report.
