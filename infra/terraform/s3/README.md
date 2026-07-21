# S3 Backups Terraform

Creates an S3 bucket for offsite backups with versioning, server-side encryption, and a lifecycle rule to transition objects to GLACIER and expire old objects.

Usage:

```bash
cd infra/terraform/s3
terraform init
terraform plan -var="bucket_name=my-ecommerce-backups" -var="region=us-east-1"
terraform apply -var="bucket_name=my-ecommerce-backups" -var="region=us-east-1" -auto-approve
```

Required IAM permissions for the principal running Terraform:

- s3:CreateBucket, s3:PutBucketVersioning, s3:PutBucketLifecycleConfiguration
- s3:PutEncryptionConfiguration
- s3:PutBucketPublicAccessBlock
