import argparse
import time

from rich.console import Console
from rich.live import Live

from csv_recorder import CsvRecorder
from display import make_table
from metrics import AVAILABLE_METRICS, DEFAULT_METRICS
from obd_reader import ObdReader
from telemetry import TelemetryPoint
from session_manifest import SessionManifest
from upload_package import UploadPackage

console = Console()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--session-id",
        type=str,
        default=None,
        help="Backend session ID for this recording.",
    )

    parser.add_argument(
        "--vehicle-id",
        type=str,
        default=None,
        help="Backend vehicle ID for this recording.",
    )

    parser.add_argument(
        "--metrics",
        nargs="+",
        default=DEFAULT_METRICS,
        choices=list(AVAILABLE_METRICS.keys()),
        help="Telemetry metrics to record.",
    )

    parser.add_argument(
        "--rate",
        type=float,
        default=5.0,
        help="Samples per second.",
    )

    return parser.parse_args()


def main() -> None:
    args = parse_args()
    selected_metrics = args.metrics

    console.print("[bold green]Selected metrics:[/bold green]")
    for metric in selected_metrics:
        console.print(f"- {metric}")

    console.print("[bold green]Connecting to vehicle...[/bold green]")

    reader = ObdReader(selected_metrics)

    console.print("[bold green]Connected![/bold green]")
    console.print("[yellow]Press Ctrl+C to finish and save the run.[/yellow]")

    recorder = CsvRecorder(
        selected_metrics=selected_metrics,
        session_id=args.session_id,
        vehicle_id=args.vehicle_id,
    )
    recorder.start()

    manifest = SessionManifest(
        session_id=args.session_id,
        vehicle_id=args.vehicle_id,
        selected_metrics=selected_metrics,
        sample_rate=args.rate,
    )

    sample_count = 0
    latest_point = TelemetryPoint(timestamp="", values={metric: None for metric in selected_metrics})

    delay_seconds = 1 / args.rate

    try:
        with Live(
            make_table(latest_point, sample_count, recorder.active_file),
            refresh_per_second=10,
        ) as live:
            while True:
                latest_point = reader.read_point()
                recorder.write_point(latest_point)

                sample_count += 1
                manifest.increment_samples()
                live.update(make_table(latest_point, sample_count, recorder.active_file))

                time.sleep(delay_seconds)

    except KeyboardInterrupt:
        finished_file = recorder.finish()
        manifest_file = manifest.finish(finished_file)

        package = UploadPackage(
            csv_file=finished_file,
            manifest_file=manifest_file,
        )
        package.validate()

        console.print()
        console.print(f"[bold green]Run saved:[/bold green] {finished_file}")
        console.print(f"[bold green]Manifest saved:[/bold green] {manifest_file}")
        console.print(package.print_summary())
        
if __name__ == "__main__":
    main()