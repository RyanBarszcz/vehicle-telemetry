import json
import time
from datetime import datetime, timezone


class SessionManifest:
    def __init__(
        self,
        session_id: str | None,
        vehicle_id: str | None,
        selected_metrics: list[str],
        sample_rate: float,
    ) -> None:
        self.session_id = session_id
        self.vehicle_id = vehicle_id
        self.selected_metrics = selected_metrics
        self.sample_rate = sample_rate

        self.started_at = datetime.now(timezone.utc)
        self.started_monotonic = time.monotonic()
        self.sample_count = 0

    def increment_samples(self) -> None:
        self.sample_count += 1

    def finish(
        self,
        csv_file_name: str,
    ) -> tuple[str, bytes, dict]:
        ended_at = datetime.now(timezone.utc)

        duration_seconds = max(
            0,
            round(
                time.monotonic() -
                self.started_monotonic
            ),
        )

        manifest = {
            "session_id": self.session_id,
            "vehicle_id": self.vehicle_id,
            "selected_metrics": self.selected_metrics,
            "sample_rate": self.sample_rate,
            "started_at": self.started_at.isoformat(),
            "ended_at": ended_at.isoformat(),
            "duration_seconds": duration_seconds,
            "sample_count": self.sample_count,
            "csv_file": csv_file_name,
        }

        if self.session_id:
            manifest_file_name = (
                f"session_{self.session_id}_manifest.json"
            )
        else:
            manifest_file_name = "session_manifest.json"

        manifest_bytes = json.dumps(
            manifest,
            indent=2,
        ).encode("utf-8")

        return (
            manifest_file_name,
            manifest_bytes,
            manifest,
        )