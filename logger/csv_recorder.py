import csv
from datetime import datetime
from pathlib import Path

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

        self.runs_dir = Path("runs")
        self.active_dir = self.runs_dir / "active"
        self.completed_dir = self.runs_dir / "completed"

        self.active_dir.mkdir(parents=True, exist_ok=True)
        self.completed_dir.mkdir(parents=True, exist_ok=True)

        self.active_file = self.active_dir / "current_run.tmp.csv"
        self.file = None
        self.writer = None

    def start(self) -> None:
        self.file = self.active_file.open("w", newline="")
        self.writer = csv.DictWriter(self.file, fieldnames=self.fields)
        self.writer.writeheader()
        self.file.flush()

    def write_point(self, point: TelemetryPoint) -> None:
        if self.writer is None or self.file is None:
            raise RuntimeError("CSV recorder has not been started.")

        self.writer.writerow(point.to_dict())
        self.file.flush()

    def finish(self) -> Path:
        if self.file is not None:
            self.file.close()

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

        if self.session_id:
            finished_name = f"session_{self.session_id}_{timestamp}.csv"
        else:
            finished_name = f"{timestamp}_gti.csv"

        finished_file = self.completed_dir / finished_name

        self.active_file.rename(finished_file)
        return finished_file