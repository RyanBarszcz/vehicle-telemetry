import type { Vehicle } from "@/types/vehicle";
import type { LocalTelemetryPoint } from "@/lib/localTelemetryDb";

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

export type TelemetryPoint = {
  id: string;
  session_id: string;
  timestamp: string;

  rpm: number;
  speed_mph: number;
  throttle_percent: number;
  coolant_temp_f: number;

  intake_temp_f: number | null;
  boost_psi: number | null;
  fuel_level_percent: number | null;
  battery_voltage: number | null;
};

export type CreateTelemetryPointInput = {
  timestamp?: string;

  rpm: number;
  speed_mph: number;
  throttle_percent: number;
  coolant_temp_f: number;

  intake_temp_f?: number;
  boost_psi?: number;
  fuel_level_percent?: number;
  battery_voltage?: number;
};

export async function getSessionTelemetry(
  token: string,
  sessionId: string
): Promise<TelemetryPoint[]> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}/telemetry`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Get telemetry failed:", res.status, errorText);
    throw new Error("Failed to fetch telemetry");
  }

  return res.json();
}

export async function createTelemetryPoint(
  token: string,
  sessionId: string,
  point: CreateTelemetryPointInput
): Promise<TelemetryPoint> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}/telemetry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(point),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Create telemetry failed:", res.status, errorText);
    throw new Error("Failed to create telemetry point");
  }

  return res.json();
}

export type EndSessionInput = {
    title?: string;
    duration_seconds: number;
    distance_miles?: number | null;
    max_speed_mph: number;
    avg_speed_mph?: number | null;
    max_rpm: number;
};

export async function endSession(
    token: string,
    sessionId: string,
    data: EndSessionInput
): Promise<DrivingSession> {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/end`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Failed to end session");
    }

    return res.json();
}

export async function createTelemetryBatch(
    token: string,
    sessionId: string,
    points: LocalTelemetryPoint[]
) {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/telemetry/batch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points }),
    });

    if (!res.ok) {
        throw new Error("Failed to upload telemetry batch");
    }

    return res.json();
}

export type DashboardVehicleSummary = {
    id: string;
    name: string;
    year: number | null;
    make: string;
    model: string;
};

export type DashboardSessionSummary = {
    id: string;
    title: string;
    vehicle_name: string;
    duration_seconds: number;
    distance_miles: number | null;
    max_speed_mph: number;
};

export type DashboardSummary = {
    vehicle_count: number;
    session_count: number;
    miles_logged: number;
    active_alert_count: number;
    vehicles: DashboardVehicleSummary[];
    recent_sessions: DashboardSessionSummary[];
};

export async function getDashboardSummary(
    token: string
): Promise<DashboardSummary> {
    const res = await fetch(`${API_URL}/dashboard`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch dashboard summary");
    }

    return res.json();
}

export type DrivingSession = {
    id: string;
    vehicle_id: string;
    title: string | null;
    started_at: string;
    ended_at: string | null;
    duration_seconds: number;
    distance_miles: number | null;
    max_speed_mph: number;
    avg_speed_mph: number | null;
    max_rpm: number;
    created_at: string;
};

export async function getSessions(token: string): Promise<DrivingSession[]> {
    const res = await fetch(`${API_URL}/sessions`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch sessions");
    }

    return res.json();
}