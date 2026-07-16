const LOGGER_URL =
    process.env.NEXT_PUBLIC_LOGGER_URL ??
    "http://127.0.0.1:8765";

export async function checkLoggerHealth(): Promise<boolean> {
    try {
        const controller = new AbortController();

        const timeoutId = window.setTimeout(() => {
            controller.abort();
        }, 2000);

        const response = await fetch(`${LOGGER_URL}/health`, {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
        });

        window.clearTimeout(timeoutId);

        return response.ok;
    } catch {
        return false;
    }
}

export type LoggerPointValue =
    | string
    | number
    | null;

export type StartLoggerSessionInput = {
    session_id: string;
    vehicle_id: string;
    selected_metrics: string[];
    sample_rate?: number;
    auth_token: string;
};

export type LoggerUploadStatus =
    | "uploaded"
    | "pending"
    | null;

export type LoggerFilePair = {
    csv_file: string;
    manifest_file: string;
};

export type LoggerStatus = {
    is_connected: boolean;
    is_connecting: boolean;
    is_recording: boolean;
    connection_status:
        | "idle"
        | "connecting"
        | "connected"
        | "failed";
    session_id: string | null;
    vehicle_id: string | null;
    selected_metrics: string[];
    sample_rate: number;
    sample_count: number;
    latest_point: Record<string, LoggerPointValue> | null;
    last_file: LoggerFilePair | null;
    upload_status: LoggerUploadStatus;
    error: string | null;
};

export type StopLoggerResponse = {
    message: string;
    last_file: LoggerFilePair | null;
    upload_status: LoggerUploadStatus;
    error: string | null;
};

async function getErrorMessage(
    response: Response,
    fallback: string
): Promise<string> {
    try {
        const body = (await response.json()) as {
            detail?: string;
        };

        return body.detail ?? fallback;
    } catch {
        return fallback;
    }
}

export async function connectLogger(): Promise<void> {
    const response = await fetch(
        `${LOGGER_URL}/connect`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to connect logger."
        );
    }
}

export async function startLoggerSession(
    input: StartLoggerSessionInput
): Promise<{
    message: string;
    session_id: string;
}> {
    const response = await fetch(
        `${LOGGER_URL}/start`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...input,
                sample_rate:
                    input.sample_rate ?? 5,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                "Failed to start local logger."
            )
        );
    }

    return response.json();
}

export async function stopLoggerSession(): Promise<StopLoggerResponse> {
    const response = await fetch(
        `${LOGGER_URL}/stop`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                "Failed to stop local logger."
            )
        );
    }

    return response.json();
}

export async function getLoggerStatus(): Promise<LoggerStatus> {
    const response = await fetch(
        `${LOGGER_URL}/status`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                "Failed to get local logger status."
            )
        );
    }

    return response.json();
}