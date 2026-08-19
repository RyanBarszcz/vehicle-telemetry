resource "aws_cloudwatch_log_group" "backend" {
  name = "/ecs/driveiq-backend"
}

resource "aws_cloudwatch_log_group" "worker" {
  name = "/ecs/driveiq-worker"
}