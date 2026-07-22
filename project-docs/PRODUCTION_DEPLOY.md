# Production Deploy Guide

This guide summarizes steps to prepare and deploy the project to production. Many steps are automated in `.github/workflows/ci-cd.yml`, but some local checks and secrets setup are required.

1. Prerequisites

- Docker & Docker Compose
- kubectl configured for target cluster
- GitHub repository secrets set: `DOCKER_REGISTRY`, `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `KUBECONFIG` (base64)
  - For GitHub Container Registry (`ghcr.io`), the workflow can also use `username: ${{ github.actor }}` and `password: ${{ secrets.GITHUB_TOKEN }}` instead of `DOCKER_USERNAME` / `DOCKER_PASSWORD`.
- Ensure `JWT_SECRET` and DB credentials are stored securely (Kubernetes Secrets or a secrets manager)

2. Local build & tests

Backend:

```bash
cd backend/backend-springboot
./gradlew clean build
./gradlew test
```

Frontend (root workspace):

```bash
cd frontend
npm ci
npm run build --workspace=host
npm run build --workspace=mfe-auth
npm run build --workspace=mfe-products
npm run build --workspace=mfe-cart
npm run build --workspace=mfe-checkout
npm run build --workspace=mfe-orders
npm run build --workspace=mfe-admin
```

Note: On Windows you may encounter file-lock/permission errors during `npm ci` (for example, `lightningcss` native bindings). If so:

- Close editors or terminals that may be using the repo
- Remove `node_modules` and retry: `rm -rf node_modules` (or use Explorer)
- Run PowerShell as Administrator if necessary

3. Container images (CI will build/push automatically)

Local test build:

```bash
docker build -t myrepo/backend-springboot:local -f backend/backend-springboot/Dockerfile backend/backend-springboot
docker build --build-arg APP_NAME=host -t myrepo/frontend-host:local -f frontend/Dockerfile frontend
```

4. Kubernetes deploy (after images are pushed and secrets applied)

```bash
kubectl apply -f k8s/00-common.yaml
kubectl apply -f k8s/01-database.yaml
kubectl apply -f k8s/02-backend.yaml
kubectl apply -f k8s/03-frontend.yaml
kubectl apply -f k8s/04-ingress.yaml
```

5. Post-deploy checks

- `kubectl -n ecommerce get pods` — confirm pods are Running
- `kubectl -n ecommerce logs deployment/backend` — check server logs
- Visit https://yourdomain.com to verify frontend

### Create S3 bucket for backups (recommended)

You can create an S3 bucket with lifecycle rules using the included Terraform module:

```bash
cd infra/terraform/s3
terraform init
terraform apply -var="bucket_name=my-ecommerce-backups" -auto-approve
```

After creation, add the bucket name and AWS credentials to your cluster secrets (see `k8s/production-secrets.yaml.example`).

6. Rollback

- Use `kubectl rollout undo deployment/backend` to revert backend.

If you'd like, I can continue automating other steps (create Helm charts, add monitoring manifests, run builds in CI). I attempted to run `npm ci` locally but it failed due to a Windows file-lock; that must be resolved locally or via CI runners.
