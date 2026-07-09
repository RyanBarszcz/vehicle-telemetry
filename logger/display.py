from pathlib import Path

from rich.table import Table

from metrics import AVAILABLE_METRICS
from telemetry import TelemetryPoint


def make_table(
    point: TelemetryPoint,
    sample_count: int,
    active_file: Path,
) -> Table:
    table = Table(title="GTI Live Telemetry Recording")

    table.add_column("Metric")
    table.add_column("Value")

    table.add_row("Samples", str(sample_count))

    for metric_key, value in point.values.items():
        label = AVAILABLE_METRICS[metric_key]["label"]
        table.add_row(label, str(value))

    table.add_row("Saving To", str(active_file))

    return table