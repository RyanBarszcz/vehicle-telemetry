export type GarageVehicle = {
  id: string;

  userId: string;

  vehicleId: string;

  role: "OWNER" | "EDITOR" | "VIEWER";

  addedAt: string;
};