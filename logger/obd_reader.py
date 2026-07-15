import obd

from metrics import AVAILABLE_METRICS
from telemetry import TelemetryPoint, now_timestamp


KPA_TO_PSI = 0.1450377377


class ObdReader:
    def __init__(self, selected_metrics: list[str]) -> None:
        unknown_metrics = [
            metric
            for metric in selected_metrics
            if metric not in AVAILABLE_METRICS
        ]

        if unknown_metrics:
            raise ValueError(
                "Unknown metrics: "
                + ", ".join(unknown_metrics)
            )

        self.selected_metrics = selected_metrics
        self.connection = obd.OBD()

        if not self.connection.is_connected():
            raise RuntimeError(
                "Failed to connect to OBD-II adapter."
            )

    def read_float(self, command) -> float | None:
        response = self.connection.query(command)

        if response.is_null():
            return None

        value = response.value

        if hasattr(value, "to"):
            unit_text = str(value.units)

            if "degree_Celsius" in unit_text:
                value = value.to("degF")
            elif "kilometer_per_hour" in unit_text:
                value = value.to("mph")

        return float(value.magnitude)

    def read_command_metric(
        self,
        metric_key: str,
    ) -> float | None:
        metric = AVAILABLE_METRICS[metric_key]
        command = metric.get("command")

        if command is None:
            return None

        return self.read_float(command)

    def calculate_boost_psi(
        self,
        intake_pressure_kpa: float | None,
        barometric_pressure_kpa: float | None,
    ) -> float | None:
        if (
            intake_pressure_kpa is None
            or barometric_pressure_kpa is None
        ):
            return None

        boost_psi = (
            intake_pressure_kpa
            - barometric_pressure_kpa
        ) * KPA_TO_PSI

        return round(boost_psi, 2)

    def read_point(self) -> TelemetryPoint:
        values: dict[str, float | None] = {}

        needs_intake_pressure = (
            "intake_pressure_kpa" in self.selected_metrics
            or "boost_psi" in self.selected_metrics
        )
        needs_barometric_pressure = (
            "barometric_pressure_kpa" in self.selected_metrics
            or "boost_psi" in self.selected_metrics
        )

        intake_pressure_kpa = (
            self.read_command_metric("intake_pressure_kpa")
            if needs_intake_pressure
            else None
        )
        barometric_pressure_kpa = (
            self.read_command_metric("barometric_pressure_kpa")
            if needs_barometric_pressure
            else None
        )

        for metric_key in self.selected_metrics:
            if metric_key == "boost_psi":
                values[metric_key] = self.calculate_boost_psi(
                    intake_pressure_kpa,
                    barometric_pressure_kpa,
                )
            elif metric_key == "intake_pressure_kpa":
                values[metric_key] = intake_pressure_kpa
            elif metric_key == "barometric_pressure_kpa":
                values[metric_key] = barometric_pressure_kpa
            else:
                values[metric_key] = self.read_command_metric(
                    metric_key
                )

        return TelemetryPoint(
            timestamp=now_timestamp(),
            values=values,
        )