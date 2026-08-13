import json
import logging

import boto3

from app.core.config import settings
from app.services.s3_service import download_session_csv_from_s3


logging.basicConfig(
    level=logging.INFO,
    format=(
        "%(asctime)s "
        "%(levelname)s "
        "%(name)s "
        "%(message)s"
    ),
)

logger = logging.getLogger(__name__)


sqs_client = boto3.client(
    "sqs",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)


def process_message(message: dict) -> None:
    body = json.loads(message["Body"])

    event_type = body.get("event_type")

    if event_type != "telemetry.session_uploaded":
        raise ValueError(
            f"Unsupported event type: {event_type}"
        )

    session_id = body["session_id"]
    s3_key = body["s3_key"]

    logger.info(
        "Processing session=%s s3_key=%s",
        session_id,
        s3_key,
    )

    csv_bytes = download_session_csv_from_s3(
        s3_key
    )

    logger.info(
        "Downloaded bytes=%s session=%s",
        len(csv_bytes),
        session_id,
    )


def poll_once() -> None:
    if not settings.SQS_TELEMETRY_QUEUE_URL:
        raise RuntimeError(
            "SQS_TELEMETRY_QUEUE_URL is not configured"
        )

    response = sqs_client.receive_message(
        QueueUrl=settings.SQS_TELEMETRY_QUEUE_URL,
        MaxNumberOfMessages=1,
        WaitTimeSeconds=20,
    )

    messages = response.get("Messages", [])

    if not messages:
        logger.info("No messages available")
        return

    message = messages[0]

    try:
        process_message(message)

        sqs_client.delete_message(
            QueueUrl=settings.SQS_TELEMETRY_QUEUE_URL,
            ReceiptHandle=message["ReceiptHandle"],
        )

        logger.info(
            "Message processed and deleted"
        )

    except Exception:
        logger.exception(
            "Message processing failed"
        )

        raise


def run_worker() -> None:
    logger.info("Telemetry worker started")

    while True:
        try:
            poll_once()

        except KeyboardInterrupt:
            logger.info(
                "Telemetry worker stopped"
            )
            break

        except Exception:
            logger.exception(
                "Worker iteration failed"
            )


if __name__ == "__main__":
    run_worker()