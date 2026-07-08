from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class TelemetryPoint:
    timestamp: str
    rpm: float | None
    throttle_percent: float | None

    def to_dict(self) -> dict:
        return asdict(self)


def now_timestamp() -> str:
    return datetime.now().isoformat(timespec="milliseconds")