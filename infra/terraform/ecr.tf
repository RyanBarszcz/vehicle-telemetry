resource "aws_ecr_repository" "backend" {
  name = "driveiq-backend"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "worker" {
  name = "driveiq-worker"

  image_scanning_configuration {
    scan_on_push = true
  }
}