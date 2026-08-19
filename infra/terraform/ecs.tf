resource "aws_ecs_cluster" "main" {
  name = "driveiq-cluster"
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "driveiq-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs_execution.arn
  task_role_arn      = aws_iam_role.backend_task.arn

  container_definitions = jsonencode([
    {
      name      = "driveiq-backend"
      image     = var.backend_image
      essential = true

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "FRONTEND_URL"
          value = "https://telemetry.ryanbarszcz.com"
        }
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${data.aws_secretsmanager_secret.backend_production.arn}:DATABASE_URL::"
        },
        {
          name      = "CLERK_SECRET_KEY"
          valueFrom = "${data.aws_secretsmanager_secret.backend_production.arn}:CLERK_SECRET_KEY::"
        },
        {
          name      = "CLERK_JWKS_URL"
          valueFrom = "${data.aws_secretsmanager_secret.backend_production.arn}:CLERK_JWKS_URL::"
        },
        {
          name      = "CLERK_ISSUER"
          valueFrom = "${data.aws_secretsmanager_secret.backend_production.arn}:CLERK_ISSUER::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = "us-east-2"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "worker" {
  family                   = "driveiq-worker"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs_execution.arn
  task_role_arn      = aws_iam_role.worker_task.arn

  container_definitions = jsonencode([
    {
      name      = "driveiq-worker"
      image     = var.worker_image
      essential = true

      environment = [
        {
          name  = "AWS_REGION"
          value = "us-east-2"
        },
        {
          name  = "S3_BUCKET_NAME"
          value = aws_s3_bucket.telemetry.bucket
        },
        {
          name  = "SQS_TELEMETRY_QUEUE_URL"
          value = aws_sqs_queue.telemetry.url
        },
        {
          name  = "FRONTEND_URL"
          value = "https://telemetry.ryanbarszcz.com"
        }
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${data.aws_secretsmanager_secret.backend_production.arn}:DATABASE_URL::"
        },
        {
          name      = "CLERK_SECRET_KEY"
          valueFrom = "${data.aws_secretsmanager_secret.backend_production.arn}:CLERK_SECRET_KEY::"
        },
        {
          name      = "CLERK_JWKS_URL"
          valueFrom = "${data.aws_secretsmanager_secret.backend_production.arn}:CLERK_JWKS_URL::"
        },
        {
          name      = "CLERK_ISSUER"
          valueFrom = "${data.aws_secretsmanager_secret.backend_production.arn}:CLERK_ISSUER::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.worker.name
          "awslogs-region"        = "us-east-2"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "backend" {
  name            = "driveiq-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn

  desired_count    = 1
  launch_type      = "FARGATE"
  platform_version = "LATEST"

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  enable_execute_command = false

  network_configuration {
    subnets = [
      "subnet-011d4e7ca947586cc",
      "subnet-0ded90aa40d330bbd",
      "subnet-053f95c2f1ad37e8c"
    ]

    security_groups = [
      "sg-0fae7ac1e2f6a1043"
    ]

    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "driveiq-backend"
    container_port   = 8000
  }

  lifecycle {
    ignore_changes = [
      task_definition
    ]
  }
}

resource "aws_ecs_service" "worker" {
  name            = "driveiq-worker-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.worker.arn

  desired_count    = 1
  launch_type      = "FARGATE"
  platform_version = "LATEST"

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  enable_execute_command = false

  network_configuration {
    subnets = [
      "subnet-011d4e7ca947586cc",
      "subnet-0ded90aa40d330bbd",
      "subnet-053f95c2f1ad37e8c"
    ]

    security_groups = [
      "sg-0fae7ac1e2f6a1043"
    ]

    assign_public_ip = true
  }

  lifecycle {
    ignore_changes = [
      task_definition
    ]
  }
}