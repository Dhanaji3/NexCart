# Project Guide

This guide combines the key setup, architecture, and quick start information for the monorepo.

## Overview

This repository contains:

## Current implementation notes

- The backend now accepts cart quantity updates through the JSON-based cart route used by the frontend.
- Admin product edits persist stock values correctly, including payloads that send inStock and stock.
- Order endpoints are role-aware: ordinary users see their own orders, while admins see all orders and can update their statuses.

- `frontend/` — Vue 3 micro-frontends with host shell and remote MFEs
- `backend/` — Spring Boot backend API (`backend/backend-springboot`) plus legacy Express API
- `database/` — PostgreSQL setup with Docker Compose and migrations
- `k8s/` — Kubernetes manifests for production deployment
- `project-docs/root-docs/` — central project documentation and scripts

## Quick Start

### Option 1: Docker Compose

```bash
docker-compose up -d
```

Then open:

- Frontend: `http://localhost:5000`
- Backend API: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- pgAdmin: `http://localhost:5050`

### Option 2: Local Development

#### Database

```bash
cd database
docker-compose up -d
```

#### Backend

```bash
cd backend/backend-springboot
mvn clean install
mvn spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Folder Structure

### frontend

- `host/` — host shell application
- `mfe-auth/`, `mfe-products/`, `mfe-cart/`, `mfe-checkout/`, `mfe-orders/`, `mfe-admin/`
- `shared/` — shared types, stores, composables, and utilities

### backend

- `backend-springboot/` — primary Spring Boot API
- `api-server/` — legacy Express API fallback

### database

- PostgreSQL compose setup
- init and seed scripts
- migrations

### k8s

- Kubernetes manifests for production deployment

## Useful Commands

### Backend

```bash
cd backend/backend-springboot
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm run dev
```

### Database

```bash
cd database
docker-compose up -d
```

## Notes

- The primary backend API runs on port `8080`.
- The host frontend runs on port `5000`.
- Use the `project-docs/root-docs/` folder for project-specific documentation and scripts.
