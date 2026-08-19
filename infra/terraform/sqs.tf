resource "aws_sqs_queue" "telemetry_dlq" {
  name = "driveiq-telemetry-processing-dlq"

  visibility_timeout_seconds = 30
  message_retention_seconds  = 345600
  max_message_size           = 1048576
  delay_seconds              = 0
  receive_wait_time_seconds  = 0

  sqs_managed_sse_enabled = true
}

resource "aws_sqs_queue" "telemetry" {
  name = "driveiq-telemetry-processing"

  visibility_timeout_seconds = 30
  message_retention_seconds  = 345600
  max_message_size           = 1048576
  delay_seconds              = 0
  receive_wait_time_seconds  = 0

  sqs_managed_sse_enabled = true
}

resource "aws_sqs_queue_redrive_policy" "telemetry" {
  queue_url = aws_sqs_queue.telemetry.id

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.telemetry_dlq.arn
    maxReceiveCount     = 3
  })
}