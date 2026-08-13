"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    startLoggerSession,
    stopLoggerSession,
} from "@/lib/loggerClient";

import {
    endSession,
    type DrivingSession,
} from "@/lib/api";

import {
    defaultTrackedMetrics,
    type TelemetryMetricKey,
} from "@/lib/telemetryMetrics";

import { useObdConnection } from "@/hooks/live-session/useObdConnection";
import { useLiveTelemetry } from "@/hooks/live-session/useLiveTelemetry";
import { useLiveSessionTimer } from "@/hooks/live-session/useLiveSessionTimer";

import SessionHeader from "@/components/sessions/SessionHeader";
import SessionChart from "@/components/sessions/SessionChart";
import EndSessionModal from "@/components/sessions/EndSessionModal";
import TrackingOptionsModal from "@/components/sessions/TrackingOptionsModal";
import ObdConnectionModal from "@/components/sessions/ObdConnectionModal";

type LiveSessionViewProps = {
    initialSession: DrivingSession;
};

export default function LiveSessionView({
    initialSession,
}: LiveSessionViewProps) {
    const router = useRouter();
    const { getToken } = useAuth();

    const [session, setSession] =
        useState<DrivingSession>(initialSession);

    const [trackingConfirmed, setTrackingConfirmed] =
        useState(false);

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

    /*
     * Physical OBD connection.
     *
     * /connect starts the logger's OBD connection thread.
     * /status is temporarily polled until the adapter either
     * connects or fails.
     *
     * Live telemetry itself does not use this polling path.
     */
    const {
        connectionStatus,
        connectionStartedAt,
        connectionError,
    } = useObdConnection({
        enabled: !session.ended_at,
    });

    /*
     * Live telemetry flow:
     *
     * OBD-II
     *   ↓
     * local Python logger
     *   ↓
     * WebSocket
     *   ↓
     * useLiveTelemetry
     *   ↓
     * SessionChart
     *
     * The old 250 ms /status telemetry polling has been removed.
     */
    const {
        currentPoint,
        telemetryPoints,
        liveStats,
        setLiveStats,
        liveStatsRef,
    } = useLiveTelemetry({
        sessionId: session.id,
        trackedMetrics,
        enabled:
            trackingConfirmed &&
            !captureStopped &&
            !session.ended_at,
        initialDurationSeconds:
            initialSession.duration_seconds,
        initialDistanceMiles:
            initialSession.distance_miles ?? 0,
        initialMaxSpeedMph:
            initialSession.max_speed_mph,
        initialAvgSpeedMph:
            initialSession.avg_speed_mph ?? 0,
        initialMaxRpm:
            initialSession.max_rpm,
    });

    /*
     * The live timer is independent of telemetry delivery.
     *
     * If a telemetry point is delayed or temporarily missed,
     * the displayed session duration still keeps running.
     */
    useLiveSessionTimer({
        enabled:
            trackingConfirmed &&
            !captureStopped &&
            !session.ended_at,
        initialDurationSeconds:
            initialSession.duration_seconds,
        setLiveStats,
    });

    function handleEndSession() {
        setCaptureStopped(true);
        setShowEndModal(true);
    }

    function handleCancelEndSession() {
        setShowEndModal(false);
        setCaptureStopped(false);
    }

    /*
     * Completed drive flow:
     *
     * Browser
     *   ↓
     * logger /stop
     *   ↓
     * CSV + manifest
     *   ↓
     * backend
     *   ↓
     * S3
     *   ↓
     * SQS
     *   ↓
     * background worker
     *
     * Once the logger confirms the upload completed, the
     * normal DriveIQ backend session is marked ended.
     */
    async function handleSaveEndedSession(title: string) {
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

            const stopResult =
                await stopLoggerSession(token);

            if (stopResult.upload_status !== "uploaded") {
                throw new Error(
                    stopResult.error ??
                    "The logger created the files, but the upload failed."
                );
            }

            const finalStats =
                liveStatsRef.current;

            const updatedSession = await endSession(
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
                        startedAt={
                            connectionStartedAt
                        }
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
                            const toastId =
                                toast.loading(
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
                                    session_id:
                                        session.id,
                                    vehicle_id:
                                        session.vehicle_id,
                                    selected_metrics:
                                        metrics,
                                    sample_rate: 5,
                                    auth_token: token,
                                });

                                setTrackedMetrics(
                                    metrics
                                );

                                /*
                                 * Once tracking is confirmed,
                                 * the live telemetry and timer
                                 * hooks become active.
                                 */
                                setTrackingConfirmed(
                                    true
                                );

                                toast.success(
                                    "Telemetry tracking started.",
                                    {
                                        id:
                                            toastId,
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
                                        id:
                                            toastId,
                                    }
                                );
                            }
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
                    maxRpm={Math.round(
                        liveStats.max_rpm
                    )}
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