export type DrivingSession = {
  id: string;

  vehicleId: string;

  title: string;

  startedAt: string;
  endedAt?: string;

  durationSeconds: number;

  distanceMiles?: number;

  maxSpeedMph: number;
  avgSpeedMph?: number;

  maxRpm: number;

  createdAt: string;
};