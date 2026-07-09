from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class TelemetryPoint:
    timestamp: str
    values: dict[str, Any]

    def to_dict(self) -> dict:
        return {
            "timestamp": self.timestamp,
            **self.values,
        }


def now_timestamp() -> str:
    return datetime.now().isoformat(timespec="milliseconds")