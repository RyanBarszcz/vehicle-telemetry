import json
from datetime import datetime
from pathlib import Path


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
        self.started_at = datetime.now()
        self.ended_at = None
        self.sample_count = 0

    def increment_samples(self) -> None:
        self.sample_count += 1

    def finish(self, csv_file: Path) -> Path:
        self.ended_at = datetime.now()

        manifest_file = csv_file.with_suffix(".json")

        data = {
            "session_id": self.session_id,
            "vehicle_id": self.vehicle_id,
            "selected_metrics": self.selected_metrics,
            "sample_rate": self.sample_rate,
            "started_at": self.started_at.isoformat(timespec="milliseconds"),
            "ended_at": self.ended_at.isoformat(timespec="milliseconds"),
            "duration_seconds": int((self.ended_at - self.started_at).total_seconds()),
            "sample_count": self.sample_count,
            "csv_file": csv_file.name,
        }

        manifest_file.write_text(json.dumps(data, indent=2))

        return manifest_file