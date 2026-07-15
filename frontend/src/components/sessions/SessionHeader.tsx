"use client";

import type { DrivingSession } from "@/lib/api";
import type { LiveSessionStats, LiveTelemetryPoint } from "@/types/telemetry";
import { formatDuration } from "@/lib/formatters";
import DownloadSessionCsvButton from "@/components/sessions/DownloadSessionCsvButton";

type SessionHeaderProps = {
    session: DrivingSession;
    liveStats: LiveSessionStats;
    onEndSession?: () => void;
};

export default function SessionHeader({
    session,
    liveStats,
    onEndSession,
}: SessionHeaderProps) {
    const isActive = !session.ended_at;

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">{session.title}</h1>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${isActive
                                ? "bg-green-500/10 text-green-400"
                                : "bg-zinc-500/10 text-zinc-400"
                                }`}
                        >
                            {isActive ? "Active" : "Completed"}
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-zinc-400">
                        {new Date(session.started_at).toLocaleDateString()} •{" "}
                        {formatDuration(liveStats.duration_seconds)}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isActive ? (
                        onEndSession && (
                            <button
                                onClick={onEndSession}
                                className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                            >
                                End Session
                            </button>
                        )
                    ) : (
                        <DownloadSessionCsvButton sessionId={session.id} />
                    )}
                </div>
            </div>
        </section>
    );
}