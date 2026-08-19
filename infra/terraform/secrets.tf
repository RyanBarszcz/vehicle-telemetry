data "aws_secretsmanager_secret" "backend_production" {
  name = "driveiq/backend/production"
}