import obd


AVAILABLE_METRICS = {
    # Core driving data
    "rpm": {
        "label": "RPM",
        "command": obd.commands.RPM,
    },
    "speed_mph": {
        "label": "Speed MPH",
        "command": obd.commands.SPEED,
    },
    "throttle_percent": {
        "label": "Throttle Position %",
        "command": obd.commands.THROTTLE_POS,
    },
    "accelerator_percent": {
        "label": "Accelerator Pedal %",
        "command": obd.commands.RELATIVE_ACCEL_POS,
    },
    "engine_load_percent": {
        "label": "Engine Load %",
        "command": obd.commands.ENGINE_LOAD,
    },
    "absolute_load_percent": {
        "label": "Absolute Engine Load %",
        "command": obd.commands.ABSOLUTE_LOAD,
    },

    # Temperatures
    "coolant_temp_f": {
        "label": "Coolant Temp °F",
        "command": obd.commands.COOLANT_TEMP,
    },
    "intake_temp_f": {
        "label": "Intake Temp °F",
        "command": obd.commands.INTAKE_TEMP,
    },
    "engine_oil_temp_f": {
        "label": "Engine Oil Temp °F",
        "command": obd.commands.OIL_TEMP,
    },
    "ambient_temp_f": {
        "label": "Ambient Temp °F",
        "command": obd.commands.AMBIANT_AIR_TEMP,
    },
    "catalyst_temp_f": {
        "label": "Catalyst Temp °F",
        "command": obd.commands.CATALYST_TEMP_B1S1,
    },

    # Air and boost-related data
    "intake_pressure_kpa": {
        "label": "Intake Manifold Pressure",
        "command": obd.commands.INTAKE_PRESSURE,
    },
    "barometric_pressure_kpa": {
        "label": "Barometric Pressure",
        "command": obd.commands.BAROMETRIC_PRESSURE,
    },
    "boost_psi": {
        "label": "Boost Pressure",
        "derived": True,
    },
    "maf_gps": {
        "label": "Mass Air Flow",
        "command": obd.commands.MAF,
    },

    # Fuel system
    "short_fuel_trim_percent": {
        "label": "Short-Term Fuel Trim",
        "command": obd.commands.SHORT_FUEL_TRIM_1,
    },
    "long_fuel_trim_percent": {
        "label": "Long-Term Fuel Trim",
        "command": obd.commands.LONG_FUEL_TRIM_1,
    },
    "fuel_level_percent": {
        "label": "Fuel Level %",
        "command": obd.commands.FUEL_LEVEL,
    },
    "fuel_rate_lph": {
        "label": "Fuel Rate",
        "command": obd.commands.FUEL_RATE,
    },
    "fuel_rail_pressure_kpa": {
        "label": "Fuel Rail Pressure",
        "command": obd.commands.FUEL_RAIL_PRESSURE_DIRECT,
    },
    "commanded_equivalence_ratio": {
        "label": "Commanded Equivalence Ratio",
        "command": obd.commands.COMMANDED_EQUIV_RATIO,
    },

    # Ignition and electrical data
    "timing_advance_degrees": {
        "label": "Timing Advance",
        "command": obd.commands.TIMING_ADVANCE,
    },
    "battery_voltage": {
        "label": "Control Module Voltage",
        "command": obd.commands.CONTROL_MODULE_VOLTAGE,
    },

    # Session information
    "engine_runtime_seconds": {
        "label": "Engine Runtime",
        "command": obd.commands.RUN_TIME,
    },
}


DEFAULT_METRICS = [
    "rpm",
    "speed_mph",
    "throttle_percent",
    "engine_load_percent",
    "coolant_temp_f",
    "intake_temp_f",
    "intake_pressure_kpa",
    "barometric_pressure_kpa",
    "boost_psi",
    "timing_advance_degrees",
    "battery_voltage",
]