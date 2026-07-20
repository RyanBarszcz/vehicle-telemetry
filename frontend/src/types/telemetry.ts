import { TelemetryMetricKey } from "@/lib/telemetryMetrics";

export type TelemetryPoint = {
  timestamp: string;

  rpm: number;

  speedMph: number;

  throttlePercent: number;

  coolantTempF: number;

  intakeTempF?: number;

  boostPsi?: number;

  fuelLevelPercent?: number;

  batteryVoltage?: number;
};

export type LiveTelemetryPoint = {
    timestamp: string;
} & Partial <
    Record <
        TelemetryMetricKey,
        number | null
    >
>;

export type LiveSessionStats = {
    duration_seconds: number;
    distance_miles: number;
    max_speed_mph: number;
    avg_speed_mph: number;
    max_rpm: number;
    telemetry_count: number;
    speed_sum_mph: number;
};