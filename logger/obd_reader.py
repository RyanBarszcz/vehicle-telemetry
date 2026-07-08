import obd

from telemetry import TelemetryPoint, now_timestamp


class ObdReader:
    def __init__(self) -> None:
        self.connection = obd.OBD()

        if not self.connection.is_connected():
            raise RuntimeError("Failed to connect to OBD-II adapter.")

    def read_float(self, command) -> float | None:
        response = self.connection.query(command)

        if response.is_null():
            return None

        return float(response.value.magnitude)

    def read_point(self) -> TelemetryPoint:
        return TelemetryPoint(
            timestamp=now_timestamp(),
            rpm=self.read_float(obd.commands.RPM),
            throttle_percent=self.read_float(obd.commands.THROTTLE_POS),
        )