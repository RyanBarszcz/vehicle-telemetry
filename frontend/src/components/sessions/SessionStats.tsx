import { Activity, Gauge, Route, Timer } from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";
import type { DrivingSession } from "@/lib/api";
import type { LiveSessionStats } from "@/app/sessions/[sessionId]/page";

type SessionStatsProps = {
    session: DrivingSession;
    liveStats: LiveSessionStats;
};

export default function SessionStats({ liveStats }: SessionStatsProps) {
    const durationMinutes = Math.floor(liveStats.duration_seconds / 60);

    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
                label="Duration"
                value={`${durationMinutes} min`}
                icon={<Timer />}
            />

            <MetricCard
                label="Distance"
                value={`${liveStats.distance_miles.toFixed(1)} mi`}
                icon={<Route />}
            />

            <MetricCard
                label="Max Speed"
                value={`${Math.round(liveStats.max_speed_mph)} mph`}
                icon={<Activity />}
            />

            <MetricCard
                label="Max RPM"
                value={liveStats.max_rpm.toLocaleString()}
                icon={<Gauge />}
            />
        </section>
    );
}