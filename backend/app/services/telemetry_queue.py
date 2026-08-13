import json
from app.core.config import settings

import boto3


sqs_client = boto3.client(
    "sqs",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)

def send_session_uploaded_event(
    session_id: str,
    s3_key: str,
) -> None:
    message = {
        "event_type": "telemetry.session_uploaded",
        "session_id": session_id,
        "s3_key": s3_key,
    }

    sqs_client.send_message(
        QueueUrl=settings.SQS_TELEMETRY_QUEUE_URL,
        MessageBody=json.dumps(message),
    )