import csv
from datetime import datetime
from pathlib import Path

from telemetry import TelemetryPoint


FIELDS = [
    "timestamp",
    "rpm",
    "throttle_percent",
]


class CsvRecorder:
    def __init__(self) -> None:
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
        self.writer = csv.DictWriter(self.file, fieldnames=FIELDS)
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

        finished_name = datetime.now().strftime("%Y-%m-%d_%H-%M-%S_gti.csv")
        finished_file = self.completed_dir / finished_name

        self.active_file.rename(finished_file)

        return finished_file