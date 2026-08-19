variable "backend_image" {
  description = "Docker image used by the DriveIQ backend ECS task"
  type        = string
}

variable "worker_image" {
  description = "Docker image used by the DriveIQ worker ECS task"
  type        = string
}