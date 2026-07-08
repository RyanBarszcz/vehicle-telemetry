import time

from rich.console import Console
from rich.live import Live

from csv_recorder import CsvRecorder
from display import make_table
from obd_reader import ObdReader
from telemetry import TelemetryPoint

console = Console()


def main() -> None:
    console.print("[bold green]Connecting to vehicle...[/bold green]")

    reader = ObdReader()

    console.print("[bold green]Connected![/bold green]")
    console.print("[yellow]Press Ctrl+C to finish and save the run.[/yellow]")

    recorder = CsvRecorder()
    recorder.start()

    sample_count = 0
    latest_point = TelemetryPoint(
        timestamp="",
        rpm=None,
        throttle_percent=None,
    )

    try:
        with Live(
            make_table(latest_point, sample_count, recorder.active_file),
            refresh_per_second=10,
        ) as live:
            while True:
                latest_point = reader.read_point()
                recorder.write_point(latest_point)

                sample_count += 1

                live.update(
                    make_table(
                        latest_point,
                        sample_count,
                        recorder.active_file,
                    )
                )

                time.sleep(0.2)

    except KeyboardInterrupt:
        finished_file = recorder.finish()

        console.print()
        console.print(f"[bold green]Run saved:[/bold green] {finished_file}")


if __name__ == "__main__":
    main()