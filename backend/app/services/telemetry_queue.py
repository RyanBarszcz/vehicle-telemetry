import json
import os

import boto3


AWS_REGION = os.getenv("AWS_REGION")
SQS_TELEMETRY_QUEUE_URL = os.getenv(
    "SQS_TELEMETRY_QUEUE_URL"
)

sqs_client = boto3.client(
    "sqs",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

def send_session_uploaded_event(
    session_id: str,
    s3_key: str,
) -> None:
    if not SQS_TELEMETRY_QUEUE_URL:
        raise RuntimeError(
            "SQS_TELEMETRY_QUEUE_URL is not configured"
        )

    message = {
        "event_type": "telemetry.session_uploaded",
        "session_id": session_id,
        "s3_key": s3_key,
    }

    sqs_client.send_message(
        QueueUrl=SQS_TELEMETRY_QUEUE_URL,
        MessageBody=json.dumps(message),
    )