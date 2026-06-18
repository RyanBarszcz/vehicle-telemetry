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