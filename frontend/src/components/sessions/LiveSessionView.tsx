"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    connectLogger,
    getLoggerStatus,
    startLoggerSession,
    stopLoggerSession,
} from "@/lib/loggerClient";

import SessionHeader from "@/components/sessions/SessionHeader";
// import SessionStats from "@/components/sessions/SessionStats";
import SessionChart from "@/components/sessions/SessionChart";
import EndSessionModal from "@/components/sessions/EndSessionModal";
import TrackingOptionsModal from "@/components/sessions/TrackingOptionsModal";
import ObdConnectionModal from "@/components/sessions/ObdConnectionModal";

import {
    endSession,
    type DrivingSession,
} from "@/lib/api";

import {
    defaultTrackedMetrics,
    type TelemetryMetricKey,
} from "@/lib/telemetryMetrics";

import type {
    LiveSessionStats,
    LiveTelemetryPoint,
} from "@/types/telemetry";

// 4 points/sec * 60 seconds * 3 minutes = 720
const MAX_LIVE_TELEMETRY_POINTS = 720;

type LiveSessionViewProps = {
    initialSession: DrivingSession;
};

// function numberFromLoggerValue(
//     value: string | number | null | undefined
// ): number {
//     const parsedValue = Number(value ?? 0);

//     return Number.isFinite(parsedValue)
//         ? parsedValue
//         : 0;
// }

function nullableNumberFromLoggerValue(
    value: string | number | null | undefined
): number | null {
    if (value === null || value === undefined) {
        return null;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : null;
}

export default function LiveSessionView({
    initialSession,
}: LiveSessionViewProps) {
    const router = useRouter();
    const { getToken } = useAuth();

    const [session, setSession] =
        useState<DrivingSession>(initialSession);

    const [
        trackingConfirmed,
        setTrackingConfirmed,
    ] = useState(false);

    const [trackedMetrics, setTrackedMetrics] =
        useState<TelemetryMetricKey[]>(
            initialSession.selected_metrics?.length
                ? (initialSession.selected_metrics as TelemetryMetricKey[])
                : defaultTrackedMetrics
        );

    const [showEndModal, setShowEndModal] =
        useState(false);

    const [savingEnd, setSavingEnd] =
        useState(false);

    const [captureStopped, setCaptureStopped] =
        useState(false);

    const [currentPoint, setCurrentPoint] =
        useState<LiveTelemetryPoint | null>(null);

    const [telemetryPoints, setTelemetryPoints] =
        useState<LiveTelemetryPoint[]>([]);

    const [liveStats, setLiveStats] =
        useState<LiveSessionStats>({
            duration_seconds:
                initialSession.duration_seconds,
            distance_miles:
                initialSession.distance_miles ?? 0,
            max_speed_mph:
                initialSession.max_speed_mph,
            avg_speed_mph:
                initialSession.avg_speed_mph ?? 0,
            max_rpm: initialSession.max_rpm,
            telemetry_count: 0,
            speed_sum_mph: 0,
        });
    const [connectionStatus, setConnectionStatus] =
        useState<
            "connecting" | "connected" | "failed"
        >("connecting");

    const [connectionStartedAt] =
        useState(() => Date.now());

    const [connectionError, setConnectionError] =
        useState<string | null>(null);

    useEffect(() => {
        if (session.ended_at) {
            return;
        }

        let cancelled = false;
        let intervalId: number | null = null;

        async function beginConnection() {
            try {
                setConnectionStatus("connecting");
                setConnectionError(null);

                await connectLogger();

                intervalId = window.setInterval(
                    async () => {
                        try {
                            const status =
                                await getLoggerStatus();

                            if (cancelled) {
                                return;
                            }

                            if (status.is_connected) {
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
                                status.connection_status ===
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

                setConnectionStatus("failed");

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
                window.clearInterval(intervalId);
            }
        };
    }, [session.ended_at]);

    /*
     * performance.now() is used for elapsed time because it
     * does not jump when the operating-system clock changes.
     */
    const timerStartedAtRef = useRef<number | null>(
        null
    );

    /*
     * /status returns the most recent logger point. Because
     * the frontend polls repeatedly, the same point could be
     * returned more than once. This prevents duplicate chart
     * and stats updates.
     */
    const lastPointTimestampRef =
        useRef<string | null>(null);

    /*
     * Keep the current calculated values available during
     * end-session saving without waiting for another render.
     */
    const liveStatsRef =
        useRef<LiveSessionStats>(liveStats);

    useEffect(() => {
        liveStatsRef.current = liveStats;
    }, [liveStats]);

    const handleTelemetryPoint = useCallback(
        (point: LiveTelemetryPoint) => {
            setCurrentPoint(point);

            setTelemetryPoints((previousPoints) => [
                ...previousPoints.slice(
                    -(MAX_LIVE_TELEMETRY_POINTS - 1)
                ),
                point,
            ]);

            setLiveStats((previousStats) => {
                const telemetryCount =
                    previousStats.telemetry_count + 1;

                const speedMph = point.speed_mph ?? 0;
                const rpm = point.rpm ?? 0;

                const speedSumMph =
                    previousStats.speed_sum_mph +
                    (point.speed_mph ?? 0);

                return {
                    ...previousStats,
                    max_speed_mph: Math.max(
                        previousStats.max_speed_mph,
                        speedMph
                    ),
                    avg_speed_mph:
                        speedSumMph / telemetryCount,
                    max_rpm: Math.max(
                        previousStats.max_rpm,
                        rpm
                    ),
                    telemetry_count:
                        telemetryCount,
                    speed_sum_mph: speedSumMph,
                };
            });
        },
        []
    );

    /*
     * Run the live timer independently from incoming points.
     * The logger remains responsible for the final manifest
     * duration.
     */
    useEffect(() => {
        if (
            session.ended_at ||
            captureStopped ||
            !trackingConfirmed
        ) {
            return;
        }

        if (timerStartedAtRef.current === null) {
            timerStartedAtRef.current =
                performance.now() -
                initialSession.duration_seconds * 1000;
        }

        const intervalId = window.setInterval(() => {
            const timerStartedAt =
                timerStartedAtRef.current;

            if (timerStartedAt === null) {
                return;
            }

            const elapsedSeconds = Math.max(
                0,
                Math.floor(
                    (
                        performance.now() -
                        timerStartedAt
                    ) / 1000
                )
            );

            setLiveStats((previousStats) => ({
                ...previousStats,
                duration_seconds:
                    elapsedSeconds,
            }));
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [
        captureStopped,
        initialSession.duration_seconds,
        session.ended_at,
        trackingConfirmed,
    ]);

    /*
     * Poll only for live display values. Python is writing
     * the permanent CSV and manifest.
     */
    useEffect(() => {
        if (
            session.ended_at ||
            captureStopped ||
            !trackingConfirmed
        ) {
            return;
        }

        let requestInProgress = false;

        const pollLogger = async () => {
            if (requestInProgress) {
                return;
            }

            requestInProgress = true;

            try {
                const status =
                    await getLoggerStatus();

                if (status.error) {
                    console.error(
                        "Logger error:",
                        status.error
                    );
                }

                if (
                    status.session_id &&
                    status.session_id !== session.id
                ) {
                    console.warn(
                        "Logger is recording a different session.",
                        {
                            expectedSessionId:
                                session.id,
                            loggerSessionId:
                                status.session_id,
                        }
                    );

                    return;
                }

                const values =
                    status.latest_point;

                if (!values) {
                    return;
                }

                const timestamp =
                    typeof values.timestamp ===
                        "string"
                        ? values.timestamp
                        : new Date().toISOString();

                if (
                    lastPointTimestampRef.current ===
                    timestamp
                ) {
                    return;
                }

                lastPointTimestampRef.current =
                    timestamp;

                const point: LiveTelemetryPoint = {
                    timestamp,
                };

                for (const metric of trackedMetrics) {
                    point[metric] = nullableNumberFromLoggerValue(
                        values[metric]
                    );
                }

                handleTelemetryPoint(point);
            } catch (error) {
                console.error(
                    "Failed to poll logger status",
                    error
                );
            } finally {
                requestInProgress = false;
            }
        };

        void pollLogger();

        const intervalId = window.setInterval(
            () => {
                void pollLogger();
            },
            250
        );

        return () => {
            window.clearInterval(intervalId);
        };
    }, [
        captureStopped,
        handleTelemetryPoint,
        session.ended_at,
        session.id,
        trackingConfirmed,
        trackedMetrics
    ]);

    function handleEndSession() {
        setCaptureStopped(true);
        setShowEndModal(true);
    }

    function handleCancelEndSession() {
        setShowEndModal(false);
        setCaptureStopped(false);
    }

    async function handleSaveEndedSession(
        title: string
    ) {
        const toastId = toast.loading(
            "Stopping logger and uploading session..."
        );

        setSavingEnd(true);

        try {
            const token = await getToken();

            if (!token) {
                throw new Error(
                    "Please sign in before saving."
                );
            }

            /*
             * The logger's /stop route:
             * 1. stops the recording loop;
             * 2. finalizes the CSV;
             * 3. creates the manifest;
             * 4. attempts the backend upload;
             * 5. returns the upload result.
             */
            const stopResult =
                await stopLoggerSession(token);

            if (
                stopResult.upload_status !==
                "uploaded"
            ) {
                throw new Error(
                    stopResult.error ??
                    "The logger created the files, but the upload failed."
                );
            }

            const finalStats =
                liveStatsRef.current;

            const updatedSession =
                await endSession(
                    token,
                    session.id,
                    {
                        title,
                        duration_seconds: Math.max(
                            0,
                            Math.round(
                                finalStats.duration_seconds
                            )
                        ),
                        distance_miles:
                            finalStats.distance_miles,
                        max_speed_mph:
                            finalStats.max_speed_mph,
                        avg_speed_mph:
                            finalStats.avg_speed_mph,
                        max_rpm: Math.round(
                            finalStats.max_rpm
                        ),
                    }
                );

            setSession(updatedSession);
            setShowEndModal(false);

            toast.success(
                "Session uploaded and saved.",
                {
                    id: toastId,
                }
            );

            router.push("/sessions");
            router.refresh();
        } catch (error) {
            console.error(
                "Failed to finish session",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to finish the session.",
                {
                    id: toastId,
                }
            );

            /*
             * Keep the end modal open. The user should not be
             * redirected when the upload or backend update
             * failed.
             */
        } finally {
            setSavingEnd(false);
        }
    }

    return (
        <>
            <SessionHeader
                session={session}
                liveStats={liveStats}
                onEndSession={handleEndSession}
            />
            {/* 
            <SessionStats
                session={session}
                liveStats={liveStats}
            /> */}

            <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                <SessionChart
                    sessionId={session.id}
                    points={telemetryPoints}
                    currentPoint={currentPoint}
                    trackedMetrics={trackedMetrics}
                    onReorderMetrics={
                        setTrackedMetrics
                    }
                />
            </section>


            {connectionStatus === "connecting" &&
                !session.ended_at && (
                    <ObdConnectionModal
                        startedAt={connectionStartedAt}
                    />
                )}

            {connectionStatus === "failed" &&
                !session.ended_at && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-950 p-8 text-center text-white shadow-2xl">
                            <h2 className="text-xl font-bold">
                                OBD connection failed
                            </h2>

                            <p className="mt-3 text-sm text-red-300">
                                {connectionError ??
                                    "Unable to connect to the OBD-II adapter."}
                            </p>
                        </div>
                    </div>
                )}

            {connectionStatus === "connected" &&
                !trackingConfirmed &&
                !session.ended_at && (
                    <TrackingOptionsModal
                        onConfirm={async (metrics) => {
                            const toastId = toast.loading(
                                "Starting telemetry..."
                            );

                            try {
                                const token =
                                    await getToken();

                                if (!token) {
                                    throw new Error(
                                        "Please sign in before tracking."
                                    );
                                }

                                await startLoggerSession({
                                    session_id: session.id,
                                    vehicle_id:
                                        session.vehicle_id,
                                    selected_metrics:
                                        metrics,
                                    sample_rate: 5,
                                    auth_token: token,
                                });

                                setTrackedMetrics(metrics);
                                setTrackingConfirmed(true);

                                toast.success(
                                    "Telemetry tracking started.",
                                    {
                                        id: toastId,
                                    }
                                );
                            } catch (error) {
                                console.error(
                                    "Failed to start logger",
                                    error
                                );

                                toast.error(
                                    error instanceof Error
                                        ? error.message
                                        : "Failed to start telemetry.",
                                    {
                                        id: toastId,
                                    }
                                );
                            }
                        }}
                    />
                )
            }

            {showEndModal && (
                <EndSessionModal
                    defaultTitle={session.title}
                    durationSeconds={
                        liveStats.duration_seconds
                    }
                    distanceMiles={
                        liveStats.distance_miles
                    }
                    maxSpeedMph={
                        liveStats.max_speed_mph
                    }
                    avgSpeedMph={
                        liveStats.avg_speed_mph
                    }
                    maxRpm={Math.round(liveStats.max_rpm)}
                    saving={savingEnd}
                    onCancel={
                        handleCancelEndSession
                    }
                    onSave={
                        handleSaveEndedSession
                    }
                />
            )}
        </>
    );
}