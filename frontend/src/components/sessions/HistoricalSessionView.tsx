"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import SessionHeader from "@/components/sessions/SessionHeader";
import SessionStats from "@/components/sessions/SessionStats";
import SessionChart from "@/components/sessions/SessionChart";

import { getSessionTelemetry, type DrivingSession } from "@/lib/api";
import {
    defaultTrackedMetrics,
    type TelemetryMetricKey,
} from "@/lib/telemetryMetrics";
import type { LiveSessionStats, LiveTelemetryPoint } from "@/types/telemetry";

type HistoricalSessionViewProps = {
    session: DrivingSession;
};

export default function HistoricalSessionView({
    session,
}: HistoricalSessionViewProps) {
    const { getToken } = useAuth();

    const [loadingTelemetry, setLoadingTelemetry] = useState(true);
    const [telemetryPoints, setTelemetryPoints] = useState<LiveTelemetryPoint[]>(
        []
    );

    const [trackedMetrics, setTrackedMetrics] =
        useState<TelemetryMetricKey[]>(defaultTrackedMetrics);

    useEffect(() => {
        async function loadTelemetry() {
            try {
                const token = await getToken();

                if (!token) {
                    toast.error("Please sign in.");
                    return;
                }

                const points = await getSessionTelemetry(token, session.id);
                setTelemetryPoints(points);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load telemetry");
            } finally {
                setLoadingTelemetry(false);
            }
        }

        loadTelemetry();
    }, [getToken, session.id]);

    const currentPoint = telemetryPoints[telemetryPoints.length - 1] ?? null;

    const liveStats: LiveSessionStats = {
        duration_seconds: session.duration_seconds,
        distance_miles: session.distance_miles ?? 0,
        max_speed_mph: session.max_speed_mph,
        avg_speed_mph: session.avg_speed_mph ?? 0,
        max_rpm: session.max_rpm,
        telemetry_count: telemetryPoints.length,
        speed_sum_mph: telemetryPoints.reduce(
            (sum, point) => sum + point.speed_mph,
            0
        ),
    };

    return (
        <>
            <SessionHeader
                session={session}
                liveStats={liveStats}
                currentPoint={currentPoint}
                onEndSession={() => { }}
            />

            <SessionStats session={session} liveStats={liveStats} />

            {loadingTelemetry ? (
                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <p className="text-sm text-zinc-400">Loading telemetry...</p>
                </section>
            ) : (
                <SessionChart
                    sessionId={session.id}
                    points={telemetryPoints}
                    currentPoint={null}
                    trackedMetrics={trackedMetrics}
                    onReorderMetrics={setTrackedMetrics}
                />
            )}
        </>
    );
}