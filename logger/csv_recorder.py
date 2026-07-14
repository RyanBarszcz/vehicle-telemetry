import csv
import io
from datetime import datetime, timezone

from telemetry import TelemetryPoint


class CsvRecorder:
    def __init__(
        self,
        selected_metrics: list[str],
        session_id: str | None = None,
        vehicle_id: str | None = None,
    ) -> None:
        self.fields = ["timestamp", *selected_metrics]
        self.session_id = session_id
        self.vehicle_id = vehicle_id

        self.buffer: io.StringIO | None = None
        self.writer: csv.DictWriter | None = None
        self.file_name: str | None = None

    def start(self) -> None:
        if self.buffer is not None:
            raise RuntimeError("CSV recorder has already been started.")

        self.buffer = io.StringIO(newline="")

        self.writer = csv.DictWriter(
            self.buffer,
            fieldnames=self.fields,
            extrasaction="ignore",
        )

        self.writer.writeheader()

    def write_point(self, point: TelemetryPoint) -> None:
        if self.writer is None or self.buffer is None:
            raise RuntimeError("CSV recorder has not been started.")

        self.writer.writerow(point.to_dict())

    def finish(self) -> tuple[str, bytes]:
        if self.buffer is None:
            raise RuntimeError("CSV recorder has not been started.")

        timestamp = datetime.now(timezone.utc).strftime(
            "%Y-%m-%d_%H-%M-%S"
        )

        if self.session_id:
            self.file_name = (
                f"session_{self.session_id}_{timestamp}.csv"
            )
        else:
            self.file_name = f"{timestamp}_vehicle.csv"

        csv_bytes = self.buffer.getvalue().encode("utf-8")

        self.buffer.close()
        self.buffer = None
        self.writer = None

        return self.file_name, csv_bytes