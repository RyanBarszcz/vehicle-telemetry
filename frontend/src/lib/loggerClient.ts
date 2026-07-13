const LOGGER_URL = "http://localhost:8765";

export type StartLoggerSessionInput = {
  session_id: string;
  vehicle_id: string;
  selected_metrics: string[];
  sample_rate?: number;
  auth_token: string;
};

export type LoggerStatus = {
  is_recording: boolean;
  session_id: string | null;
  vehicle_id: string | null;
  selected_metrics: string[];
  sample_rate: number;
  sample_count: number;
  latest_point: Record<string, unknown> | null;
  last_file: {
    csv_file: string;
    manifest_file: string;
  } | null;
  error: string | null;
};

export async function startLoggerSession(input: StartLoggerSessionInput) {
  const res = await fetch(`${LOGGER_URL}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      sample_rate: input.sample_rate ?? 5,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to start local logger");
  }

  return res.json();
}

export async function stopLoggerSession() {
  const res = await fetch(`${LOGGER_URL}/stop`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to stop local logger");
  }

  return res.json();
}

export async function getLoggerStatus(): Promise<LoggerStatus> {
  const res = await fetch(`${LOGGER_URL}/status`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to get local logger status");
  }

  return res.json();
}