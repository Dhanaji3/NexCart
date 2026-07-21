variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "S3 bucket name for backups"
  type        = string
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "prod"
}

variable "transition_to_glacier_days" {
  description = "Days after which objects transition to GLACIER"
  type        = number
  default     = 30
}

variable "expire_objects_days" {
  description = "Days after which objects expire"
  type        = number
  default     = 365
}
