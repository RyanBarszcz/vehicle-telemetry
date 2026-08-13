import json

import pytest

from app.services import telemetry_queue
from app.workers import telemetry_worker


def test_send_session_uploaded_event_sends_expected_message(monkeypatch):
    sent_messages = []

    class FakeSqsClient:
        def send_message(self, **kwargs):
            sent_messages.append(kwargs)

    monkeypatch.setattr(
        telemetry_queue,
        "sqs_client",
        FakeSqsClient(),
    )

    telemetry_queue.send_session_uploaded_event(
        session_id="session-123",
        s3_key="sessions/session-123/telemetry.csv",
    )

    assert len(sent_messages) == 1

    sent_message = sent_messages[0]

    assert (
        sent_message["QueueUrl"]
        == telemetry_queue.settings.SQS_TELEMETRY_QUEUE_URL
    )

    body = json.loads(
        sent_message["MessageBody"]
    )

    assert body == {
        "event_type": "telemetry.session_uploaded",
        "session_id": "session-123",
        "s3_key": "sessions/session-123/telemetry.csv",
    }


def test_successful_message_is_deleted(monkeypatch):
    deleted_messages = []

    message = {
        "Body": json.dumps(
            {
                "event_type": "telemetry.session_uploaded",
                "session_id": "session-123",
                "s3_key": "sessions/session-123/telemetry.csv",
            }
        ),
        "ReceiptHandle": "receipt-123",
    }

    class FakeSqsClient:
        def receive_message(self, **kwargs):
            return {
                "Messages": [message]
            }

        def delete_message(self, **kwargs):
            deleted_messages.append(kwargs)

    monkeypatch.setattr(
        telemetry_worker,
        "sqs_client",
        FakeSqsClient(),
    )

    monkeypatch.setattr(
        telemetry_worker,
        "process_message",
        lambda message: None,
    )

    telemetry_worker.poll_once()

    assert len(deleted_messages) == 1

    assert deleted_messages[0] == {
        "QueueUrl": (
            telemetry_worker.settings
            .SQS_TELEMETRY_QUEUE_URL
        ),
        "ReceiptHandle": "receipt-123",
    }


def test_failed_message_is_not_deleted(monkeypatch):
    deleted_messages = []

    message = {
        "Body": json.dumps(
            {
                "event_type": "telemetry.session_uploaded",
                "session_id": "session-123",
                "s3_key": "sessions/session-123/telemetry.csv",
            }
        ),
        "ReceiptHandle": "receipt-123",
    }

    class FakeSqsClient:
        def receive_message(self, **kwargs):
            return {
                "Messages": [message]
            }

        def delete_message(self, **kwargs):
            deleted_messages.append(kwargs)

    monkeypatch.setattr(
        telemetry_worker,
        "sqs_client",
        FakeSqsClient(),
    )

    def fail_processing(message):
        raise RuntimeError(
            "processing failed"
        )

    monkeypatch.setattr(
        telemetry_worker,
        "process_message",
        fail_processing,
    )

    with pytest.raises(
        RuntimeError,
        match="processing failed",
    ):
        telemetry_worker.poll_once()

    assert deleted_messages == []