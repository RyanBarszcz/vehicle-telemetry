output "alb_dns_name" {
  description = "Public DNS name for the DriveIQ application load balancer"
  value       = aws_lb.main.dns_name
}

output "backend_ecr_repository_url" {
  description = "ECR repository URL for the DriveIQ backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "worker_ecr_repository_url" {
  description = "ECR repository URL for the DriveIQ worker"
  value       = aws_ecr_repository.worker.repository_url
}

output "telemetry_bucket_name" {
  description = "S3 bucket used for DriveIQ telemetry files"
  value       = aws_s3_bucket.telemetry.bucket
}

output "telemetry_queue_url" {
  description = "SQS queue URL used for telemetry processing"
  value       = aws_sqs_queue.telemetry.url
}

output "telemetry_dlq_url" {
  description = "Dead-letter queue URL for failed telemetry processing messages"
  value       = aws_sqs_queue.telemetry_dlq.url
}

output "ecs_cluster_name" {
  description = "DriveIQ ECS cluster name"
  value       = aws_ecs_cluster.main.name
}