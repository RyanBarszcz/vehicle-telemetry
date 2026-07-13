"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import { getLoggerStatus, stopLoggerSession } from "@/lib/loggerClient";

import SessionHeader from "@/components/sessions/SessionHeader";
import SessionStats from "@/components/sessions/SessionStats";
import SessionChart from "@/components/sessions/SessionChart";
import EndSessionModal from "@/components/sessions/EndSessionModal";
import TrackingOptionsModal from "@/components/sessions/TrackingOptionsModal";

import {
    // createTelemetryBatch,
    endSession,
    type DrivingSession,
} from "@/lib/api";

import {
    defaultTrackedMetrics,
    type TelemetryMetricKey,
} from "@/lib/telemetryMetrics";

import {
    deleteLocalTelemetryPoints,
    getLocalTelemetryPoints,
    saveLocalTelemetryPoint,
} from "@/lib/localTelemetryDb";

import type { LiveSessionStats, LiveTelemetryPoint } from "@/types/telemetry";

type LiveSessionViewProps = {
    initialSession: DrivingSession;
};

export default function LiveSessionView({
    initialSession,
}: LiveSessionViewProps) {
    const router = useRouter();
    const { getToken } = useAuth();

    const [session, setSession] = useState<DrivingSession>(initialSession);

    const [trackingConfirmed, setTrackingConfirmed] = useState(false);
    const [trackedMetrics, setTrackedMetrics] =
        useState<TelemetryMetricKey[]>(defaultTrackedMetrics);

    const [showEndModal, setShowEndModal] = useState(false);
    const [savingEnd, setSavingEnd] = useState(false);
    const [captureStopped, setCaptureStopped] = useState(false);

    const [currentPoint, setCurrentPoint] =
        useState<LiveTelemetryPoint | null>(null);

    const [telemetryPoints, setTelemetryPoints] = useState<LiveTelemetryPoint[]>(
        []
    );

    const [liveStats, setLiveStats] = useState<LiveSessionStats>({
        duration_seconds: initialSession.duration_seconds,
        distance_miles: initialSession.distance_miles ?? 0,
        max_speed_mph: initialSession.max_speed_mph,
        avg_speed_mph: initialSession.avg_speed_mph ?? 0,
        max_rpm: initialSession.max_rpm,
        telemetry_count: 0,
        speed_sum_mph: 0,
    });

    useEffect(() => {
        async function loadLocalTelemetry() {
            try {
                const localPoints = await getLocalTelemetryPoints(initialSession.id);

                setTelemetryPoints(localPoints.slice(-60));
                setCurrentPoint(localPoints[localPoints.length - 1] ?? null);

                setLiveStats({
                    duration_seconds: initialSession.duration_seconds,
                    distance_miles: initialSession.distance_miles ?? 0,
                    max_speed_mph: initialSession.max_speed_mph,
                    avg_speed_mph: initialSession.avg_speed_mph ?? 0,
                    max_rpm: initialSession.max_rpm,
                    telemetry_count: localPoints.length,
                    speed_sum_mph: localPoints.reduce(
                        (sum, point) => sum + point.speed_mph,
                        0
                    ),
                });
            } catch (error) {
                console.error("Failed to load local telemetry", error);
                toast.error("Failed to load local telemetry");
            }
        }

        loadLocalTelemetry();
    }, [initialSession]);

    async function handleTelemetryPoint(point: LiveTelemetryPoint) {
        setCurrentPoint(point);
        setTelemetryPoints((prev) => [...prev.slice(-59), point]);

        setLiveStats((prev) => {
            const telemetryCount = prev.telemetry_count + 1;
            const speedSumMph = prev.speed_sum_mph + point.speed_mph;

            return {
                duration_seconds: Math.floor(
                    (Date.now() - new Date(session.started_at).getTime()) / 1000
                ),
                distance_miles: prev.distance_miles,
                max_speed_mph: Math.max(prev.max_speed_mph, point.speed_mph),
                avg_speed_mph: speedSumMph / telemetryCount,
                max_rpm: Math.max(prev.max_rpm, point.rpm),
                telemetry_count: telemetryCount,
                speed_sum_mph: speedSumMph,
            };
        });

        try {
            await saveLocalTelemetryPoint(point);
        } catch (error) {
            console.error("Failed to save telemetry locally", error);
            toast.error("Failed to save telemetry locally");
        }
    }

    function handleEndSession() {
        setCaptureStopped(true);
        setShowEndModal(true);
    }

    async function handleSaveEndedSession(title: string) {
        const toastId = toast.loading("Saving session...");
        setSavingEnd(true);

        try {
            const token = await getToken();

            if (!token) {
                toast.error("Please sign in.", { id: toastId });
                return;
            }

            await stopLoggerSession();

            const updatedSession = await endSession(token, session.id, {
                title,
                duration_seconds: liveStats.duration_seconds,
                distance_miles: liveStats.distance_miles,
                max_speed_mph: liveStats.max_speed_mph,
                avg_speed_mph: liveStats.avg_speed_mph,
                max_rpm: liveStats.max_rpm,
            });

            await deleteLocalTelemetryPoints(session.id);

            setSession(updatedSession);
            setShowEndModal(false);

            toast.success("Session saved", { id: toastId });
            router.push("/sessions");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Session saved locally. Sync failed.", { id: toastId });
        } finally {
            setSavingEnd(false);
        }
    }

    useEffect(() => {
        if (session.ended_at || captureStopped || !trackingConfirmed) return;

        const interval = window.setInterval(async () => {
            try {
                const status = await getLoggerStatus();

                if (!status.latest_point) return;

                const values = status.latest_point as Record<string, number | string | null>;

                const point: LiveTelemetryPoint = {
                    id: crypto.randomUUID(),
                    sessionId: session.id,
                    timestamp:
                        typeof values.timestamp === "string"
                            ? values.timestamp
                            : new Date().toISOString(),
                    speed_mph: Number(values.speed_mph ?? 0),
                    rpm: Number(values.rpm ?? 0),
                    throttle_percent: Number(values.throttle_percent ?? 0),
                    coolant_temp_f: Number(values.coolant_temp_f ?? 0),
                    boost_psi:
                        values.boost_psi === null || values.boost_psi === undefined
                            ? null
                            : Number(values.boost_psi),
                };

                await handleTelemetryPoint(point);
            } catch (error) {
                console.error("Failed to poll logger status", error);
            }
        }, 500);

        return () => window.clearInterval(interval);
    }, [session.id, session.ended_at, captureStopped, trackingConfirmed]);

    return (
        <>
            <SessionHeader
                session={session}
                liveStats={liveStats}
                currentPoint={currentPoint}
                onEndSession={handleEndSession}
            />

            <SessionStats session={session} liveStats={liveStats} />

            <SessionChart
                sessionId={session.id}
                points={telemetryPoints}
                currentPoint={currentPoint}
                trackedMetrics={trackedMetrics}
                onReorderMetrics={setTrackedMetrics}
            />

            {!trackingConfirmed && !session.ended_at && (
                <TrackingOptionsModal
                    onConfirm={(metrics) => {
                        setTrackedMetrics(metrics);
                        setTrackingConfirmed(true);
                    }}
                />
            )}

            {showEndModal && (
                <EndSessionModal
                    defaultTitle={session.title}
                    durationSeconds={liveStats.duration_seconds}
                    distanceMiles={liveStats.distance_miles}
                    maxSpeedMph={liveStats.max_speed_mph}
                    avgSpeedMph={liveStats.avg_speed_mph}
                    maxRpm={liveStats.max_rpm}
                    saving={savingEnd}
                    onCancel={() => {
                        setShowEndModal(false);
                        setCaptureStopped(false);
                    }}
                    onSave={handleSaveEndedSession}
                />
            )}
        </>
    );
}