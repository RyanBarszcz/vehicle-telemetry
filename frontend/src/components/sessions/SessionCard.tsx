import Link from "next/link";
import { Activity, Gauge, Route, Timer } from "lucide-react";

import type { DrivingSession } from "@/lib/api";

type SessionCardProps = {
    session: DrivingSession;
};

export default function SessionCard({ session }: SessionCardProps) {
    const durationMinutes = Math.floor(session.duration_seconds / 60);

    return (
        <Link
            href={`/sessions/${session.id}`}
            className="group block rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/40 hover:bg-white/[0.06]"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        {session.title}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                        {new Date(session.started_at).toLocaleDateString()}
                    </p>
                </div>

                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                    Complete
                </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-zinc-900/70 p-4">
                    <Timer className="mb-2 h-4 w-4 text-blue-400" />
                    <p className="text-xs text-zinc-500">Duration</p>
                    <p className="mt-1 font-semibold text-white">
                        {durationMinutes} min
                    </p>
                </div>

                <div className="rounded-2xl bg-zinc-900/70 p-4">
                    <Route className="mb-2 h-4 w-4 text-blue-400" />
                    <p className="text-xs text-zinc-500">Distance</p>
                    <p className="mt-1 font-semibold text-white">
                        {session.distance_miles ?? 0} mi
                    </p>
                </div>

                <div className="rounded-2xl bg-zinc-900/70 p-4">
                    <Activity className="mb-2 h-4 w-4 text-blue-400" />
                    <p className="text-xs text-zinc-500">Max Speed</p>
                    <p className="mt-1 font-semibold text-white">
                        {session.max_speed_mph} mph
                    </p>
                </div>

                <div className="rounded-2xl bg-zinc-900/70 p-4">
                    <Gauge className="mb-2 h-4 w-4 text-blue-400" />
                    <p className="text-xs text-zinc-500">Max RPM</p>
                    <p className="mt-1 font-semibold text-white">
                        {session.max_rpm.toLocaleString()}
                    </p>
                </div>
            </div>
        </Link>
    );
}