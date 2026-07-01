import { Gauge, Zap, Thermometer, Activity, Wind } from "lucide-react";

export type TelemetryMetricKey =
    | "speed_mph"
    | "rpm"
    | "throttle_percent"
    | "coolant_temp_f"
    | "boost_psi";

export const telemetryMetrics = {
    speed_mph: {
        label: "Speed",
        unit: "mph",
        icon: Gauge,
    },
    rpm: {
        label: "RPM",
        unit: "rpm",
        icon: Activity,
    },
    throttle_percent: {
        label: "Throttle",
        unit: "%",
        icon: Zap,
    },
    coolant_temp_f: {
        label: "Coolant Temp",
        unit: "°F",
        icon: Thermometer,
    },
    boost_psi: {
        label: "Boost",
        unit: "psi",
        icon: Wind,
    },
} satisfies Record<TelemetryMetricKey, unknown>;

export const defaultTrackedMetrics: TelemetryMetricKey[] = [
    "speed_mph",
    "rpm",
    "boost_psi",
    "coolant_temp_f",
];