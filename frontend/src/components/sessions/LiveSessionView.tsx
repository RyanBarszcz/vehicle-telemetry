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
    getLoggerStatus,
    stopLoggerSession,
} from "@/lib/loggerClient";

import SessionHeader from "@/components/sessions/SessionHeader";
import SessionStats from "@/components/sessions/SessionStats";
import SessionChart from "@/components/sessions/SessionChart";
import EndSessionModal from "@/components/sessions/EndSessionModal";
import TrackingOptionsModal from "@/components/sessions/TrackingOptionsModal";

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

type LiveSessionViewProps = {
    initialSession: DrivingSession;
};

function numberFromLoggerValue(
    value: string | number | null | undefined
): number {
    const parsedValue = Number(value ?? 0);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : 0;
}

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
                ...previousPoints.slice(-59),
                point,
            ]);

            setLiveStats((previousStats) => {
                const telemetryCount =
                    previousStats.telemetry_count + 1;

                const speedSumMph =
                    previousStats.speed_sum_mph +
                    point.speed_mph;

                return {
                    ...previousStats,
                    max_speed_mph: Math.max(
                        previousStats.max_speed_mph,
                        point.speed_mph
                    ),
                    avg_speed_mph:
                        speedSumMph / telemetryCount,
                    max_rpm: Math.max(
                        previousStats.max_rpm,
                        point.rpm
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
                    id: crypto.randomUUID(),
                    sessionId: session.id,
                    timestamp,
                    speed_mph:
                        numberFromLoggerValue(
                            values.speed_mph
                        ),
                    rpm: numberFromLoggerValue(
                        values.rpm
                    ),
                    throttle_percent:
                        numberFromLoggerValue(
                            values.throttle_percent
                        ),
                    coolant_temp_f:
                        numberFromLoggerValue(
                            values.coolant_temp_f
                        ),
                    boost_psi:
                        nullableNumberFromLoggerValue(
                            values.boost_psi
                        ),
                };

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
                await stopLoggerSession();

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
                            finalStats.duration_seconds
                        ),
                        distance_miles:
                            finalStats.distance_miles,
                        max_speed_mph:
                            finalStats.max_speed_mph,
                        avg_speed_mph:
                            finalStats.avg_speed_mph,
                        max_rpm:
                            finalStats.max_rpm,
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
                currentPoint={currentPoint}
                onEndSession={handleEndSession}
            />

            <SessionStats
                session={session}
                liveStats={liveStats}
            />

            <SessionChart
                sessionId={session.id}
                points={telemetryPoints}
                currentPoint={currentPoint}
                trackedMetrics={trackedMetrics}
                onReorderMetrics={
                    setTrackedMetrics
                }
            />

            {!trackingConfirmed &&
                !session.ended_at && (
                    <TrackingOptionsModal
                        onConfirm={(metrics) => {
                            setTrackedMetrics(
                                metrics
                            );
                            setTrackingConfirmed(
                                true
                            );
                        }}
                    />
                )}

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
                    maxRpm={liveStats.max_rpm}
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