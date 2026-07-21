# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-07-21

- Fix: Add `PROCESSING` to `orders.status` CHECK constraint to allow admin status updates to `processing`. Script: `backend/backend-springboot/update_status_check.sql`.
- Fix: `AdminController` and `OrderService` updated to accept and persist optional `trackingNumber` during status updates.
- Fix: Frontend `mfe-admin` `updateStatus()` now sends a `null` PUT body with `status` and optional `trackingNumber` as query params.
- Chore: `mfe-orders` `OrderDetail.vue` UI refinements — adjusted stepper connector position and dynamic progress overlay.

## [2026-07-01] - Prior Release

- Initial migration of features from Express API to Spring Boot backend (see project-docs/backend/backend-springboot/MIGRATION_GUIDE.md).
