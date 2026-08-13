"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    connectLogger,
    getLoggerStatus,
} from "@/lib/loggerClient";


export type ObdConnectionStatus =
    | "connecting"
    | "connected"
    | "failed";


type UseObdConnectionInput = {
    enabled: boolean;
};


export function useObdConnection({
    enabled,
}: UseObdConnectionInput) {
    const [
        connectionStatus,
        setConnectionStatus,
    ] = useState<ObdConnectionStatus>(
        "connecting"
    );

    const [connectionStartedAt] =
        useState(() => Date.now());

    const [
        connectionError,
        setConnectionError,
    ] = useState<string | null>(null);


    /*
     * OBD CONNECTION FLOW
     *
     * Browser
     *   ↓ POST /connect
     * Logger
     *   ↓
     * background OBD connection
     *   ↓
     * browser polls /status temporarily
     *
     * This polling is only used while connecting to the
     * physical OBD-II adapter.
     *
     * Live telemetry does NOT use this polling path.
     */
    useEffect(() => {
        if (!enabled) {
            return;
        }

        let cancelled = false;
        let intervalId: number | null = null;

        async function beginConnection() {
            try {
                setConnectionStatus(
                    "connecting"
                );

                setConnectionError(null);

                await connectLogger();

                intervalId =
                    window.setInterval(
                        async () => {
                            try {
                                const status =
                                    await getLoggerStatus();

                                if (cancelled) {
                                    return;
                                }

                                if (
                                    status.is_connected
                                ) {
                                    setConnectionStatus(
                                        "connected"
                                    );

                                    if (
                                        intervalId !== null
                                    ) {
                                        window.clearInterval(
                                            intervalId
                                        );
                                    }

                                    return;
                                }

                                if (
                                    status
                                        .connection_status ===
                                    "failed"
                                ) {
                                    setConnectionStatus(
                                        "failed"
                                    );

                                    setConnectionError(
                                        status.error ??
                                        "Failed to connect to OBD-II."
                                    );

                                    if (
                                        intervalId !== null
                                    ) {
                                        window.clearInterval(
                                            intervalId
                                        );
                                    }
                                }
                            } catch (error) {
                                console.error(
                                    "Failed to poll OBD connection",
                                    error
                                );
                            }
                        },
                        500
                    );

            } catch (error) {
                if (cancelled) {
                    return;
                }

                setConnectionStatus(
                    "failed"
                );

                setConnectionError(
                    error instanceof Error
                        ? error.message
                        : "Failed to begin OBD connection."
                );
            }
        }

        void beginConnection();

        return () => {
            cancelled = true;

            if (intervalId !== null) {
                window.clearInterval(
                    intervalId
                );
            }
        };
    }, [enabled]);


    return {
        connectionStatus,
        connectionStartedAt,
        connectionError,
    };
}