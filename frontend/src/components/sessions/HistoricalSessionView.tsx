"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import SessionHeader from "@/components/sessions/SessionHeader";
import SessionStats from "@/components/sessions/SessionStats";
import HistoricalSessionChart from "@/components/sessions/HistoricalSessionChart";
import DownloadSessionCsvButton from "@/components/sessions/DownloadSessionCsvButton";

import {
    getSessionCsvTelemetry,
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

type HistoricalSessionViewProps = {
    session: DrivingSession;
};

export default function HistoricalSessionView({
    session,
}: HistoricalSessionViewProps) {
    const { getToken } = useAuth();

    const [loadingTelemetry, setLoadingTelemetry] =
        useState(true);

    const [telemetryError, setTelemetryError] =
        useState<string | null>(null);

    const [telemetryPoints, setTelemetryPoints] =
        useState<LiveTelemetryPoint[]>([]);

    const [trackedMetrics, setTrackedMetrics] =
        useState<TelemetryMetricKey[]>(
            session.selected_metrics?.length
                ? (session.selected_metrics as TelemetryMetricKey[])
                : defaultTrackedMetrics
        );

    useEffect(() => {
        let cancelled = false;

        async function loadTelemetry() {
            setLoadingTelemetry(true);
            setTelemetryError(null);

            try {
                const token = await getToken();

                if (!token) {
                    throw new Error(
                        "Please sign in to view this session."
                    );
                }

                const points =
                    await getSessionCsvTelemetry(
                        token,
                        session.id
                    );

                if (!cancelled) {
                    setTelemetryPoints(points);
                }
            } catch (error) {
                console.error(
                    "Failed to load historical telemetry",
                    error
                );

                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to load telemetry.";

                if (!cancelled) {
                    setTelemetryError(message);
                }

                toast.error(message);
            } finally {
                if (!cancelled) {
                    setLoadingTelemetry(false);
                }
            }
        }

        void loadTelemetry();

        return () => {
            cancelled = true;
        };
    }, [getToken, session.id]);

    const currentPoint =
        telemetryPoints[
        telemetryPoints.length - 1
        ] ?? null;

    const liveStats =
        useMemo<LiveSessionStats>(() => {
            const speedSumMph =
                telemetryPoints.reduce(
                    (sum, point) =>
                        sum + point.speed_mph,
                    0
                );

            return {
                duration_seconds:
                    session.duration_seconds,
                distance_miles:
                    session.distance_miles ?? 0,
                max_speed_mph:
                    session.max_speed_mph,
                avg_speed_mph:
                    session.avg_speed_mph ?? 0,
                max_rpm: session.max_rpm,
                telemetry_count:
                    telemetryPoints.length,
                speed_sum_mph: speedSumMph,
            };
        }, [
            session.avg_speed_mph,
            session.distance_miles,
            session.duration_seconds,
            session.max_rpm,
            session.max_speed_mph,
            telemetryPoints,
        ]);

    return (
        <>
            <SessionHeader
                session={session}
                liveStats={liveStats}
            />

            <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                {loadingTelemetry ? (
                    <HistoricalLoadingState />
                ) : telemetryError ? (
                    <HistoricalErrorState
                        message={telemetryError}
                    />
                ) : telemetryPoints.length ===
                    0 ? (
                    <HistoricalEmptyState />
                ) : (
                    <HistoricalSessionChart
                        points={telemetryPoints}
                        trackedMetrics={
                            trackedMetrics
                        }
                        onReorderMetrics={
                            setTrackedMetrics
                        }
                    />
                )}
            </section>
        </>
    );
}

function HistoricalLoadingState() {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <p className="text-sm text-zinc-400">
                Loading recorded telemetry...
            </p>
        </div>
    );
}

function HistoricalErrorState({
    message,
}: {
    message: string;
}) {
    return (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
            <h2 className="font-semibold text-white">
                Telemetry could not be loaded
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
                {message}
            </p>
        </div>
    );
}

function HistoricalEmptyState() {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="font-semibold text-white">
                No telemetry found
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
                This session does not have a recorded
                CSV file.
            </p>
        </div>
    );
}