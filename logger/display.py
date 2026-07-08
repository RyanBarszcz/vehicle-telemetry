from pathlib import Path

from rich.table import Table

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
    table.add_row("RPM", str(point.rpm))
    table.add_row("Throttle", f"{point.throttle_percent} %")
    table.add_row("Saving To", str(active_file))

    return table