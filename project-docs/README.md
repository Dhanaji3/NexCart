# Project Docs Index

This directory contains project documentation grouped into subfolders for easier navigation.

## Current implementation notes

The current repository state includes the following behavior changes:

- Cart update requests are accepted by the backend through the JSON-based cart update route.
- Admin product editing now persists stock values correctly and supports the inStock payload shape.
- Order retrieval and status updates are role-aware, with customer users reading their own orders and admins reading/updating the full order list.

Recent important fixes:

- The `orders.status` CHECK constraint in production schemas was missing `PROCESSING`, which caused admin status updates to `processing` to fail with a 400 error. A remediation script is available at `backend/backend-springboot/update_status_check.sql`. Apply it via your DB migration tooling.

## backend

- [backend-springboot](backend/backend-springboot/)

## database

- [README.md](database/README.md)

## frontend

- [README.md](frontend/README.md)

## k8s

- [README.md](k8s/README.md)

## root-docs

- [PROJECT_GUIDE.md](root-docs/PROJECT_GUIDE.md)
- [AUDIT_COMPLETION_REPORT.md](root-docs/AUDIT_COMPLETION_REPORT.md)
- [AUDIT_REPORT.md](root-docs/AUDIT_REPORT.md)
- [BACKEND_DATABASE_SETUP.md](root-docs/BACKEND_DATABASE_SETUP.md)
- [FIX_ISSUES.md](root-docs/FIX_ISSUES.md)
- [LOCAL_DEVELOPMENT_SETUP.md](root-docs/LOCAL_DEVELOPMENT_SETUP.md)
- [NEXT_STEPS.md](root-docs/NEXT_STEPS.md)
- [NOTES.md](root-docs/NOTES.md)
- [PROJECT_DETAIL.md](root-docs/PROJECT_DETAIL.md)
- [PROJECT_GUIDE.md](root-docs/PROJECT_GUIDE.md)
- [AWS_PRODUCTION_DEPLOY.md](root-docs/AWS_PRODUCTION_DEPLOY.md) — enterprise-grade AWS deployment guide
- [FREE_DEPLOYMENT_GUIDE.md](root-docs/FREE_DEPLOYMENT_GUIDE.md)
- [RENDER_VERCEL_NEON_DEPLOY.md](root-docs/RENDER_VERCEL_NEON_DEPLOY.md) — exact Vercel settings + Render env var checklist
- [run-project.bat](root-docs/run-project.bat)
- [run-project.ps1](root-docs/run-project.ps1)
- [start-local.bat](root-docs/start-local.bat)
- [start-local.sh](root-docs/start-local.sh)
- [WORKSPACE_STRUCTURE.md](root-docs/WORKSPACE_STRUCTURE.md)
