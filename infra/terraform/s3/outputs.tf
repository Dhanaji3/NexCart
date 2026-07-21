output "bucket_arn" {
  value = aws_s3_bucket.backups.arn
}

output "bucket_domain_name" {
  value = aws_s3_bucket.backups.bucket_domain_name
}
