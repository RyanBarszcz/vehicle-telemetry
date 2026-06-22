import type { Vehicle } from "@/types/vehicle";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL");
}

export type CreateVehicleInput = {
  year: number;
  make: string;
  model: string;
  trim?: string;
  nickname?: string;
  vin?: string;
  image_url?: string;
};

export async function syncAccount(token: string) {
  const res = await fetch(`${API_URL}/auth/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Sync account failed:", res.status, errorText);
    throw new Error("Failed to sync account");
  }

  return res.json();
}

export async function getVehicles(token: string): Promise<Vehicle[]> {
  const res = await fetch(`${API_URL}/vehicles/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Get vehicles failed:", res.status, errorText);
    throw new Error("Failed to fetch vehicles");
  }

  return res.json();
}

export async function createVehicle(
  token: string,
  vehicle: CreateVehicleInput
): Promise<Vehicle> {
  const res = await fetch(`${API_URL}/vehicles/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(vehicle),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Create vehicle failed:", res.status, errorText);
    throw new Error("Failed to create vehicle");
  }

  return res.json();
}

export async function getVehicle(
  token: string,
  vehicleId: string
): Promise<Vehicle> {
  const res = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Get vehicle failed:", res.status, errorText);
    throw new Error("Failed to fetch vehicle");
  }

  return res.json();
}

export type DrivingSession = {
  id: string;
  vehicle_id: string;
  title: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  distance_miles: number | null;
  max_speed_mph: number;
  avg_speed_mph: number | null;
  max_rpm: number;
  created_at: string;
};

export type CreateSessionInput = {
  title: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  distance_miles?: number;
  max_speed_mph?: number;
  avg_speed_mph?: number;
  max_rpm?: number;
};

export async function getVehicleSessions(
  token: string,
  vehicleId: string
): Promise<DrivingSession[]> {
  const res = await fetch(`${API_URL}/vehicles/${vehicleId}/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Get vehicle sessions failed:", res.status, errorText);
    throw new Error("Failed to fetch vehicle sessions");
  }

  return res.json();
}

export async function createVehicleSession(
  token: string,
  vehicleId: string,
  session: CreateSessionInput
): Promise<DrivingSession> {
  const res = await fetch(`${API_URL}/vehicles/${vehicleId}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(session),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Create vehicle session failed:", res.status, errorText);
    throw new Error("Failed to create vehicle session");
  }

  return res.json();
}

export async function getSession(
  token: string,
  sessionId: string
): Promise<DrivingSession> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Get session failed:", res.status, errorText);
    throw new Error("Failed to fetch session");
  }

  return res.json();
}