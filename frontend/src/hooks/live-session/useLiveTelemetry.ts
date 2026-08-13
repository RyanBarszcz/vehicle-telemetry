"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    connectTelemetrySocket,
} from "@/lib/loggerClient";

import type {
    TelemetryMetricKey,
} from "@/lib/telemetryMetrics";

import type {
    LiveSessionStats,
    LiveTelemetryPoint,
} from "@/types/telemetry";


const MAX_LIVE_TELEMETRY_POINTS =
    720;


type UseLiveTelemetryInput = {
    sessionId: string;
    trackedMetrics:
        TelemetryMetricKey[];
    enabled: boolean;

    initialDurationSeconds: number;
    initialDistanceMiles: number;
    initialMaxSpeedMph: number;
    initialAvgSpeedMph: number;
    initialMaxRpm: number;
};


function nullableNumberFromLoggerValue(
    value:
        | string
        | number
        | null
        | undefined
): number | null {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const parsedValue =
        Number(value);

    return Number.isFinite(
        parsedValue
    )
        ? parsedValue
        : null;
}


export function useLiveTelemetry({
    sessionId,
    trackedMetrics,
    enabled,
    initialDurationSeconds,
    initialDistanceMiles,
    initialMaxSpeedMph,
    initialAvgSpeedMph,
    initialMaxRpm,
}: UseLiveTelemetryInput) {
    const [currentPoint, setCurrentPoint] =
        useState<LiveTelemetryPoint | null>(null);

    const [
        telemetryPoints,
        setTelemetryPoints,
    ] =
        useState<LiveTelemetryPoint[]>(
            []
        );

    const [
        liveStats,
        setLiveStats,
    ] =
        useState<LiveSessionStats>({
            duration_seconds:
                initialDurationSeconds,

            distance_miles:
                initialDistanceMiles,

            max_speed_mph:
                initialMaxSpeedMph,

            avg_speed_mph:
                initialAvgSpeedMph,

            max_rpm:
                initialMaxRpm,

            telemetry_count: 0,
            speed_sum_mph: 0,
        });

    const trackedMetricsRef = useRef(trackedMetrics);

    useEffect(() => {
        trackedMetricsRef.current = trackedMetrics;
    }, [trackedMetrics]);


    /*
     * Keep current stats available without waiting for a
     * React render.
     *
     * LiveSessionView uses this when ending a session.
     */
    const liveStatsRef =
        useRef<LiveSessionStats>(
            liveStats
        );

    useEffect(() => {
        liveStatsRef.current =
            liveStats;
    }, [liveStats]);


    /*
     * Every WebSocket telemetry message eventually reaches
     * this function.
     *
     * It updates:
     * - the latest displayed point;
     * - rolling chart history;
     * - live statistics.
     */
    const handleTelemetryPoint =
        useCallback(
            (
                point:
                    LiveTelemetryPoint
            ) => {
                setCurrentPoint(
                    point
                );

                setTelemetryPoints(
                    (
                        previousPoints
                    ) => [
                        ...previousPoints
                            .slice(
                                -(
                                    MAX_LIVE_TELEMETRY_POINTS
                                    - 1
                                )
                            ),

                        point,
                    ]
                );

                setLiveStats(
                    (
                        previousStats
                    ) => {
                        const telemetryCount =
                            previousStats
                                .telemetry_count +
                            1;

                        const speedMph =
                            point
                                .speed_mph ??
                            0;

                        const rpm =
                            point.rpm ??
                            0;

                        const speedSumMph =
                            previousStats
                                .speed_sum_mph +
                            speedMph;

                        return {
                            ...previousStats,

                            max_speed_mph:
                                Math.max(
                                    previousStats
                                        .max_speed_mph,
                                    speedMph
                                ),

                            avg_speed_mph:
                                speedSumMph /
                                telemetryCount,

                            max_rpm:
                                Math.max(
                                    previousStats
                                        .max_rpm,
                                    rpm
                                ),

                            telemetry_count:
                                telemetryCount,

                            speed_sum_mph:
                                speedSumMph,
                        };
                    }
                );
            },
            []
        );


    /*
     * LIVE TELEMETRY FLOW
     *
     * OBD-II
     *   ↓
     * local Python logger
     *   ↓
     * WebSocketManager
     *   ↓
     * /ws/telemetry
     *   ↓
     * connectTelemetrySocket()
     *   ↓
     * this hook
     *   ↓
     * React telemetry state
     *
     * This replaces the old 250ms HTTP polling loop.
     */
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const socket =
            connectTelemetrySocket({
                onTelemetry: (
                    message
                ) => {
                    /*
                     * Ignore points belonging to some other
                     * logger session.
                     */
                    if (
                        message.session_id !==
                        sessionId
                    ) {
                        console.warn(
                            "Logger is streaming a different session.",
                            {
                                expectedSessionId:
                                    sessionId,

                                loggerSessionId:
                                    message
                                        .session_id,
                            }
                        );

                        return;
                    }

                    const values =
                        message.point;

                    const timestamp =
                        typeof values
                            .timestamp ===
                            "string"
                            ? values
                                .timestamp
                            : new Date()
                                .toISOString();

                    const point:
                        LiveTelemetryPoint =
                        {
                            timestamp,
                        };

                    /*
                     * Only include metrics selected for the
                     * active session.
                     */
                    for (const metric of trackedMetricsRef.current) {
                        point[metric] =
                            nullableNumberFromLoggerValue(
                                values[
                                    metric
                                ]
                            );
                    }

                    handleTelemetryPoint(
                        point
                    );
                },

                onOpen: () => {
                    console.log(
                        "Telemetry WebSocket connected"
                    );
                },

                onClose: () => {
                    console.log(
                        "Telemetry WebSocket disconnected"
                    );
                },

                onError: () => {
                    console.error(
                        "Telemetry WebSocket error"
                    );
                },
            });


        return () => {
            socket.close();
        };

    }, [
        enabled,
        handleTelemetryPoint,
        sessionId,
    ]);


    return {
        currentPoint,
        telemetryPoints,
        liveStats,
        setLiveStats,
        liveStatsRef,
    };
}