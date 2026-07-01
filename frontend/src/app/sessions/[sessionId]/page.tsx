"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import SessionHeader from "@/components/sessions/SessionHeader";
import SessionStats from "@/components/sessions/SessionStats";
import SessionChart from "@/components/sessions/SessionChart";
import EndSessionModal from "@/components/sessions/EndSessionModal";
import {
    createTelemetryBatch,
    endSession,
    getSession,
    type DrivingSession,
} from "@/lib/api";
import TrackingOptionsModal from "@/components/sessions/TrackingOptionsModal";
import {
    defaultTrackedMetrics,
    type TelemetryMetricKey,
} from "@/lib/telemetryMetrics";
import {
    deleteLocalTelemetryPoints,
    getLocalTelemetryPoints,
    saveLocalTelemetryPoint,
} from "@/lib/localTelemetryDb";

export type LiveTelemetryPoint = {
    id: string;
    sessionId: string;
    timestamp: string;
    speed_mph: number;
    rpm: number;
    throttle_percent: number;
    coolant_temp_f: number;
    boost_psi?: number | null;
};

export type LiveSessionStats = {
    duration_seconds: number;
    distance_miles: number;
    max_speed_mph: number;
    avg_speed_mph: number;
    max_rpm: number;
    telemetry_count: number;
    speed_sum_mph: number;
};

export default function SessionPage() {
    const params = useParams<{ sessionId: string }>();
    const router = useRouter();
    const { getToken } = useAuth();

    const [session, setSession] = useState<DrivingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);

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

    const [liveStats, setLiveStats] = useState<LiveSessionStats | null>(null);

    useEffect(() => {
        async function loadSession() {
            try {
                const token = await getToken();

                if (!token) {
                    setMissing(true);
                    return;
                }

                const data = await getSession(token, params.sessionId);
                const localPoints = await getLocalTelemetryPoints(params.sessionId);

                setSession(data);
                setTelemetryPoints(localPoints.slice(-60));

                setLiveStats({
                    duration_seconds: data.duration_seconds,
                    distance_miles: data.distance_miles ?? 0,
                    max_speed_mph: data.max_speed_mph,
                    avg_speed_mph: data.avg_speed_mph ?? 0,
                    max_rpm: data.max_rpm,
                    telemetry_count: localPoints.length,
                    speed_sum_mph: localPoints.reduce(
                        (sum, point) => sum + point.speed_mph,
                        0
                    ),
                });

                setCurrentPoint(localPoints[localPoints.length - 1] ?? null);
            } catch (error) {
                console.error(error);
                setMissing(true);
            } finally {
                setLoading(false);
            }
        }

        loadSession();
    }, [getToken, params.sessionId]);

    async function handleTelemetryPoint(point: LiveTelemetryPoint) {
        setCurrentPoint(point);
        setTelemetryPoints((prev) => [...prev.slice(-59), point]);

        setLiveStats((prev) => {
            if (!prev) return prev;

            const telemetryCount = prev.telemetry_count + 1;
            const speedSumMph = prev.speed_sum_mph + point.speed_mph;

            return {
                duration_seconds: prev.duration_seconds + 1,
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
        if (!session || !liveStats) return;

        setCaptureStopped(true);
        setShowEndModal(true);
    }

    async function handleSaveEndedSession(title: string) {
        if (!session || !liveStats) return;

        const toastId = toast.loading("Saving session...");
        setSavingEnd(true);

        try {
            const token = await getToken();

            if (!token) {
                toast.error("Please sign in.", { id: toastId });
                return;
            }

            const localPoints = await getLocalTelemetryPoints(session.id);

            if (localPoints.length > 0) {
                await createTelemetryBatch(token, session.id, localPoints);
            }

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
        if (!session || session.ended_at || captureStopped || !trackingConfirmed) return;

        const interval = window.setInterval(() => {
            const point: LiveTelemetryPoint = {
                id: crypto.randomUUID(),
                sessionId: session.id,
                timestamp: new Date().toISOString(),
                speed_mph: Math.round(20 + Math.random() * 80),
                rpm: Math.round(1200 + Math.random() * 5200),
                throttle_percent: Math.round(Math.random() * 100),
                coolant_temp_f: Math.round(180 + Math.random() * 25),
                boost_psi: Number((Math.random() * 18).toFixed(1)),
            };

            handleTelemetryPoint(point);
        }, 1000);

        return () => window.clearInterval(interval);
    }, [session, captureStopped, trackingConfirmed]);

    if (loading) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <p className="text-sm text-zinc-400">Loading session...</p>
            </main>
        );
    }

    if (missing || !session || !liveStats) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
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
            </div>
        </main>
    );
}