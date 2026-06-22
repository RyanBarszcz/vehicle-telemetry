export type GarageVehicle = {
  id: string;
  user_id: string;
  vehicle_id: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  added_at: string;
};
