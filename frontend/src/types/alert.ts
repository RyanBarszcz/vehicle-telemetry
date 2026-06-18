export type VehicleAlert = {
  id: string;

  vehicleId: string;

  type:
    | "COOLANT_TEMP"
    | "BOOST"
    | "BATTERY"
    | "RPM";

  threshold: number;

  enabled: boolean;
};