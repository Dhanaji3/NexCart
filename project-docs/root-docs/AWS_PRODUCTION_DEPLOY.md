# AWS Enterprise Deployment Guide

This guide explains how to deploy the project to AWS as a production-grade, enterprise-style web application.
It includes infrastructure design, managed services, secure secrets handling, monitoring, deployments, and rollback.

## Enterprise architecture overview

The recommended AWS architecture for this repo is:

- Amazon EKS for Kubernetes deployment
- Amazon ECR for container images
- Amazon RDS PostgreSQL or Amazon Aurora for the database
- Amazon S3 for backup storage
- Amazon ACM + Route 53 for HTTPS and DNS
- AWS Secrets Manager for sensitive configs
- CloudWatch for logs and metrics
- Optional: AWS WAF and GuardDuty for security

## 1) Prerequisites

- AWS account with permissions for EKS, ECR, RDS, S3, IAM, ACM, Route 53, and CloudWatch
- AWS CLI installed and configured: `aws configure`
- `eksctl` installed
- `kubectl` installed
- `helm` installed
- `docker` installed
- `terraform` installed if you want infrastructure as code

## 2) Configure AWS CLI

```bash
aws configure
```

Use your AWS access key, secret, default region, and output format.

## 3) Choose your AWS account strategy

For enterprise readiness, use a dedicated AWS account or an AWS Organization account with separation for production.

- Create a production account if possible
- Use a separate account for non-production or staging
- Use IAM roles and MFA for all deployment users

## 4) Provision infrastructure

### 4.1 Create a dedicated VPC and subnets

Use a VPC with public and private subnets across at least two Availability Zones.
For enterprise deployment, keep workloads in private subnets and expose them via an Application Load Balancer.

If you use `eksctl`, a sample configuration looks like this:

```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: vue-microfrontends-cluster
  region: us-east-1
  version: "1.28"

vpc:
  cidr: "10.0.0.0/16"
  subnets:
    private:
      us-east-1a: { cidr: "10.0.1.0/24" }
      us-east-1b: { cidr: "10.0.2.0/24" }
    public:
      us-east-1a: { cidr: "10.0.101.0/24" }
      us-east-1b: { cidr: "10.0.102.0/24" }

managedNodeGroups:
  - name: app-nodes
    instanceType: t3.medium
    desiredCapacity: 3
    minSize: 2
    maxSize: 5
    volumeSize: 50
    iam:
      withAddonPolicies:
        albIngress: true
        autoScaler: true
        externalDNS: true
    privateNetworking: true
```

Create the cluster:

```bash
eksctl create cluster -f eks-cluster.yaml
```

### 4.2 Use managed database service

For enterprise production, do not run Postgres inside Kubernetes. Use Amazon RDS or Aurora PostgreSQL.

Create an RDS instance with:

- Multi-AZ deployment
- Encryption at rest
- Automated backups and retention
- Public access disabled
- Private network connectivity to EKS

Example:

```bash
aws rds create-db-instance \
  --db-instance-identifier ecommerce-db \
  --engine postgres \
  --db-instance-class db.t4g.medium \
  --allocated-storage 100 \
  --multi-az \
  --storage-encrypted \
  --db-name ecommerce_db \
  --master-username adminuser \
  --master-user-password "<password>" \
  --vpc-security-group-ids <sg-id> \
  --db-subnet-group-name <subnet-group>
```

### 4.3 Provision an S3 backup bucket

Create an S3 bucket for backups with versioning and lifecycle rules:

```bash
aws s3api create-bucket --bucket my-ecommerce-backups --region us-east-1 --create-bucket-configuration LocationConstraint=us-east-1
aws s3api put-bucket-versioning --bucket my-ecommerce-backups --versioning-configuration Status=Enabled
```

Add lifecycle rules to expire old backups after your retention period.

### 4.4 Reserve a domain and TLS certificate

Use Route 53 and ACM for HTTPS.

1. Register or transfer your domain to Route 53.
2. Create a public hosted zone.
3. Request an ACM certificate for `example.com` and `*.example.com`.

```bash
aws acm request-certificate \
  --domain-name example.com \
  --subject-alternative-names "*.example.com" \
  --region us-east-1 \
  --validation-method DNS
```

Validate using Route 53 DNS records.

## 5) Create ECR repositories

Create repositories for every service and frontend image.

```bash
aws ecr create-repository --repository-name backend-springboot --region us-east-1
aws ecr create-repository --repository-name frontend-host --region us-east-1
aws ecr create-repository --repository-name mfe-auth --region us-east-1
aws ecr create-repository --repository-name mfe-products --region us-east-1
aws ecr create-repository --repository-name mfe-cart --region us-east-1
aws ecr create-repository --repository-name mfe-checkout --region us-east-1
aws ecr create-repository --repository-name mfe-orders --region us-east-1
aws ecr create-repository --repository-name mfe-admin --region us-east-1
aws ecr create-repository --repository-name backup-uploader --region us-east-1
```

Then inspect the registry URI:

```bash
aws ecr describe-repositories --repository-names backend-springboot --region us-east-1
```

## 6) Authenticate Docker to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

## 7) Build and push container images

Set your registry and image tag:

```bash
REGISTRY=<account-id>.dkr.ecr.us-east-1.amazonaws.com
IMAGE_TAG=latest
```

Build and push images:

```bash
cd backend/backend-springboot
docker build -t ${REGISTRY}/backend-springboot:${IMAGE_TAG} .
docker push ${REGISTRY}/backend-springboot:${IMAGE_TAG}

cd ../../frontend
docker build --build-arg APP_NAME=host -t ${REGISTRY}/frontend-host:${IMAGE_TAG} -f Dockerfile .
docker push ${REGISTRY}/frontend-host:${IMAGE_TAG}

for APP in mfe-auth mfe-products mfe-cart mfe-checkout mfe-orders mfe-admin; do
  docker build --build-arg APP_NAME=$APP -t ${REGISTRY}/$APP:${IMAGE_TAG} -f Dockerfile .
  docker push ${REGISTRY}/$APP:${IMAGE_TAG}
done

cd ../scripts/backup-uploader
docker build -t ${REGISTRY}/backup-uploader:${IMAGE_TAG} .
docker push ${REGISTRY}/backup-uploader:${IMAGE_TAG}
```

## 8) Install EKS cluster tooling

### 8.1 AWS Load Balancer Controller

The AWS Load Balancer Controller is recommended for enterprise-grade ALB ingress.

Install the IAM OIDC provider and service account:

```bash
eksctl utils associate-iam-oidc-provider --cluster vue-microfrontends-cluster --region us-east-1 --approve
```

Create the IAM policy:

```bash
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json
aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json
```

Create the service account:

```bash
eksctl create iamserviceaccount \
  --cluster vue-microfrontends-cluster \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --attach-policy-arn arn:aws:iam::<account-id>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve
```

Install the controller:

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=vue-microfrontends-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### 8.2 Cert-manager

Install cert-manager for TLS certificate management:

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set installCRDs=true
```

### 8.3 Optional: ExternalDNS

ExternalDNS can synchronize Route 53 records automatically.

Install it if you want dynamic DNS management:

```bash
helm install external-dns bitnami/external-dns \
  --namespace external-dns --create-namespace \
  --set provider=aws \
  --set aws.zoneType=public \
  --set azure.resourceGroup= \
  --set txtOwnerId=external-dns
```

## 9) Create secrets securely

For enterprise deployments, store sensitive values in AWS Secrets Manager and sync to Kubernetes with a secrets-store CSI driver, or use Kubernetes secrets.

Create a `production-secrets.yaml` from the example:

```bash
cp k8s/production-secrets.yaml.example k8s/production-secrets.yaml
```

Update values with real production secrets.

Example secrets:

- `SPRING_DATASOURCE_URL` = `jdbc:postgresql://<rds-endpoint>:5432/ecommerce_db`
- `SPRING_DATASOURCE_USERNAME` = `<db-user>`
- `SPRING_DATASOURCE_PASSWORD` = `<db-password>`
- `JWT_SECRET` = `<strong-secret-32+chars>`
- `AWS_S3_BUCKET` = `<backup-bucket-name>`
- `AWS_REGION` = `us-east-1`

Apply the secrets to Kubernetes:

```bash
kubectl apply -f k8s/production-secrets.yaml
```

## 10) Configure enterprise manifest values

Update the chart values and manifests:

- `charts/backend/values.yaml` → set `image.repository` and `image.tag`
- `charts/frontend/values.yaml` → set `image.repository` and `image.tag`
- `charts/mfes/values.yaml` → set `imageRegistry` and image tags for each MFE
- `k8s/04-ingress.yaml` → set `host` and `tls` to your domain
- `k8s/db-backup-cronjob.yaml` → update the backup bucket/repo if needed
- `k8s/db-backup-upload-cronjob.yaml` → update credentials and bucket values

If you use RDS, disable or skip `k8s/01-database.yaml` and use the managed database instead.

## 11) Deploy to EKS

Create the enterprise namespace:

```bash
kubectl create namespace ecommerce
```

Apply manifests:

```bash
kubectl apply -f k8s/00-common.yaml
kubectl apply -f k8s/02-backend.yaml
kubectl apply -f k8s/03-frontend.yaml
kubectl apply -f k8s/04-ingress.yaml
kubectl apply -f k8s/db-backup-cronjob.yaml
kubectl apply -f k8s/db-backup-upload-cronjob.yaml
```

If you are using the Helm charts instead, deploy them with:

```bash
helm upgrade --install backend charts/backend -n ecommerce -f charts/backend/values.yaml
helm upgrade --install frontend charts/frontend -n ecommerce -f charts/frontend/values.yaml
helm upgrade --install mfes charts/mfes -n ecommerce -f charts/mfes/values.yaml
```

## 12) Validate enterprise deployment

Check the cluster state:

```bash
kubectl -n ecommerce get pods,svc,ingress,cronjob
kubectl -n ecommerce describe ingress
kubectl -n ecommerce logs deployment/backend
kubectl -n ecommerce logs deployment/frontend
```

Verify the following:

- the backend responds on the API endpoint
- the host app loads successfully
- remote `assets/remoteEntry.js` URLs are accessible
- TLS certificates are active
- the database connection is successful

## 13) Add monitoring and logging

### CloudWatch

- Enable CloudWatch Container Insights for EKS.
- Send application logs to CloudWatch via Fluent Bit or a sidecar.
- Use CloudWatch metrics and alarms for CPU, memory, pod restarts, and error rates.

### Enterprise monitoring

- Add Prometheus + Grafana for custom dashboards.
- Add Alertmanager for SLAs.
- Add AWS X-Ray if distributed tracing is needed.

## 14) CI/CD for enterprise

Use GitHub Actions or AWS CodePipeline.

The GitHub Actions workflow should:

1. lint and test the code
2. build Docker images
3. push images to ECR
4. deploy the Helm charts to EKS

Required GitHub secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REGISTRY`
- `ECR_REPOSITORY_BACKEND`
- `ECR_REPOSITORY_FRONTEND`
- `JWT_SECRET`
- `S3_BUCKET`
- `KUBECONFIG` or a deploy key for EKS

## 15) Rollback and canary

### Helm rollback

If deployment fails, rollback the release:

```bash
helm rollback backend 1 -n ecommerce
helm rollback frontend 1 -n ecommerce
helm rollback mfes 1 -n ecommerce
```

### Canary deployment

For enterprise traffic safety, consider a canary rollout using:

- Argo Rollouts
- Flagger
- AWS App Mesh

## 16) Security hardening

- Use AWS IAM roles for service accounts (IRSA).
- Use AWS Secrets Manager or Kubernetes sealed secrets.
- Encrypt secrets at rest with KMS.
- Use private networking for RDS.
- Use AWS WAF in front of ALB.
- Enforce HTTPS and HSTS.

## 17) Backup and recovery

- Use RDS automated backups and snapshots.
- Store app backups in S3 with lifecycle rules.
- Keep backup retention aligned with your recovery objectives.
- Test restore procedures periodically.

## 18) Enterprise checklist

- [ ] EKS cluster deployed in private subnets
- [ ] Managed database created in RDS/Aurora
- [ ] Container images pushed to ECR
- [ ] TLS certificate issued in ACM
- [ ] Kubernetes secrets created securely
- [ ] Ingress configured with HTTPS
- [ ] Backend and frontend services deployed
- [ ] Health checks and readiness probes passing
- [ ] CloudWatch or Prometheus monitoring configured
- [ ] GitHub Actions or CodePipeline configured
- [ ] Backup bucket and lifecycle rules enabled

## 19) Notes

- `backend/backend-springboot/src/main/resources/db/migration/V20260721__update_orders_status_check.sql` is included for the production database migration.
- Use RDS for enterprise production; do not run PostgreSQL inside Kubernetes for production.
- For corporate DNS and domain management, use Route 53 and ACM.
- For a lower-cost staging environment, you may still use the repo’s Kubernetes database manifests, but production should use managed database services.
