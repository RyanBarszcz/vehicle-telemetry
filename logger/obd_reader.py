import obd

from metrics import AVAILABLE_METRICS
from telemetry import TelemetryPoint, now_timestamp


class ObdReader:
    def __init__(self, selected_metrics: list[str]) -> None:
        self.selected_metrics = selected_metrics
        self.connection = obd.OBD()

        if not self.connection.is_connected():
            raise RuntimeError("Failed to connect to OBD-II adapter.")

    def read_float(self, command) -> float | None:
        response = self.connection.query(command)

        if response.is_null():
            return None

        value = response.value

        if hasattr(value, "to"):
            unit_text = str(value.units)

            if "degree_Celsius" in unit_text:
                value = value.to("degF")

            if "kilometer_per_hour" in unit_text:
                value = value.to("mph")

        return float(value.magnitude)

    def read_point(self) -> TelemetryPoint:
        values = {}

        for metric_key in self.selected_metrics:
            metric = AVAILABLE_METRICS[metric_key]
            values[metric_key] = self.read_float(metric["command"])

        return TelemetryPoint(
            timestamp=now_timestamp(),
            values=values,
        )