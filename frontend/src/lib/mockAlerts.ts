export type VehicleAlert = {
  id: string;
  vehicleName: string;
  title: string;
  description: string;
  threshold: string;
  enabled: boolean;
};

export const mockAlerts: VehicleAlert[] = [
  {
    id: "alert-1",
    vehicleName: "Stage 1 GTI",
    title: "Coolant Temperature",
    description: "Notify when coolant temperature gets too high.",
    threshold: "220°F",
    enabled: true,
  },
  {
    id: "alert-2",
    vehicleName: "Stage 1 GTI",
    title: "Boost Pressure",
    description: "Notify when boost pressure exceeds the expected range.",
    threshold: "24 psi",
    enabled: true,
  },
  {
    id: "alert-3",
    vehicleName: "Mustang GT Premium",
    title: "Battery Voltage",
    description: "Notify when battery voltage drops below safe levels.",
    threshold: "12.0V",
    enabled: false,
  },
];