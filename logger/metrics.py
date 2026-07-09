import obd

AVAILABLE_METRICS = {
    "rpm": {
        "label": "RPM",
        "command": obd.commands.RPM,
    },
    "throttle_percent": {
        "label": "Throttle %",
        "command": obd.commands.THROTTLE_POS,
    },
    "speed_mph": {
        "label": "Speed MPH",
        "command": obd.commands.SPEED,
    },
    "coolant_temp_f": {
        "label": "Coolant Temp °F",
        "command": obd.commands.COOLANT_TEMP,
    },
    "intake_temp_f": {
        "label": "Intake Temp °F",
        "command": obd.commands.INTAKE_TEMP,
    },
}

DEFAULT_METRICS = [
    "rpm",
    "throttle_percent",
]