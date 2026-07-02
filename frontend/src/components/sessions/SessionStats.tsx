import { Activity, Gauge, Route, Timer } from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";
import type { DrivingSession } from "@/lib/api";
import type { LiveSessionStats } from "@/types/telemetry";
import { formatDuration } from "@/lib/formatters";

type SessionStatsProps = {
    session: DrivingSession;
    liveStats: LiveSessionStats;
};

export default function SessionStats({ liveStats }: SessionStatsProps) {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
                label="Duration"
                value={formatDuration(liveStats.duration_seconds)}
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