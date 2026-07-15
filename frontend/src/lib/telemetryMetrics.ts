import {
    Activity,
    Battery,
    Cloud,
    Flame,
    Fuel,
    Gauge,
    Thermometer,
    Timer,
    Wind,
    Zap,
} from "lucide-react";

export type TelemetryMetricKey =
    // Core driving data
    | "rpm"
    | "speed_mph"
    | "throttle_percent"
    | "accelerator_percent"
    | "engine_load_percent"
    | "absolute_load_percent"

    // Temperatures
    | "coolant_temp_f"
    | "intake_temp_f"
    | "engine_oil_temp_f"
    | "ambient_temp_f"
    | "catalyst_temp_f"

    // Air and boost
    | "intake_pressure_kpa"
    | "barometric_pressure_kpa"
    | "boost_psi"
    | "maf_gps"

    // Fuel
    | "short_fuel_trim_percent"
    | "long_fuel_trim_percent"
    | "fuel_level_percent"
    | "fuel_rate_lph"
    | "fuel_rail_pressure_kpa"
    | "commanded_equivalence_ratio"

    // Ignition and electrical
    | "timing_advance_degrees"
    | "battery_voltage"

    // Session information
    | "engine_runtime_seconds";

export type TelemetryMetricDefinition = {
    label: string;
    unit: string;
    icon: typeof Gauge;
};

export const telemetryMetrics = {
    rpm: {
        label: "RPM",
        unit: "rpm",
        icon: Activity,
    },
    speed_mph: {
        label: "Speed",
        unit: "mph",
        icon: Gauge,
    },
    throttle_percent: {
        label: "Throttle Position",
        unit: "%",
        icon: Zap,
    },
    accelerator_percent: {
        label: "Accelerator Pedal",
        unit: "%",
        icon: Zap,
    },
    engine_load_percent: {
        label: "Engine Load",
        unit: "%",
        icon: Activity,
    },
    absolute_load_percent: {
        label: "Absolute Engine Load",
        unit: "%",
        icon: Activity,
    },

    coolant_temp_f: {
        label: "Coolant Temperature",
        unit: "°F",
        icon: Thermometer,
    },
    intake_temp_f: {
        label: "Intake Air Temperature",
        unit: "°F",
        icon: Thermometer,
    },
    engine_oil_temp_f: {
        label: "Engine Oil Temperature",
        unit: "°F",
        icon: Thermometer,
    },
    ambient_temp_f: {
        label: "Ambient Temperature",
        unit: "°F",
        icon: Thermometer,
    },
    catalyst_temp_f: {
        label: "Catalyst Temperature",
        unit: "°F",
        icon: Flame,
    },

    intake_pressure_kpa: {
        label: "Intake Manifold Pressure",
        unit: "kPa",
        icon: Wind,
    },
    barometric_pressure_kpa: {
        label: "Barometric Pressure",
        unit: "kPa",
        icon: Cloud,
    },
    boost_psi: {
        label: "Boost Pressure",
        unit: "psi",
        icon: Wind,
    },
    maf_gps: {
        label: "Mass Air Flow",
        unit: "g/s",
        icon: Wind,
    },

    short_fuel_trim_percent: {
        label: "Short-Term Fuel Trim",
        unit: "%",
        icon: Fuel,
    },
    long_fuel_trim_percent: {
        label: "Long-Term Fuel Trim",
        unit: "%",
        icon: Fuel,
    },
    fuel_level_percent: {
        label: "Fuel Level",
        unit: "%",
        icon: Fuel,
    },
    fuel_rate_lph: {
        label: "Fuel Rate",
        unit: "L/h",
        icon: Fuel,
    },
    fuel_rail_pressure_kpa: {
        label: "Fuel Rail Pressure",
        unit: "kPa",
        icon: Fuel,
    },
    commanded_equivalence_ratio: {
        label: "Commanded Equivalence Ratio",
        unit: "λ",
        icon: Fuel,
    },

    timing_advance_degrees: {
        label: "Timing Advance",
        unit: "°",
        icon: Zap,
    },
    battery_voltage: {
        label: "Battery Voltage",
        unit: "V",
        icon: Battery,
    },

    engine_runtime_seconds: {
        label: "Engine Runtime",
        unit: "sec",
        icon: Timer,
    },
} satisfies Record<TelemetryMetricKey, TelemetryMetricDefinition>;

export const defaultTrackedMetrics: TelemetryMetricKey[] = [
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
];