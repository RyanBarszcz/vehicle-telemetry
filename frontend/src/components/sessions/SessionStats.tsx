import { Activity, Gauge, Route, Timer } from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";
import type { DrivingSession } from "@/lib/api";

type SessionStatsProps = {
    session: DrivingSession;
};

export default function SessionStats({ session }: SessionStatsProps) {
    const durationMinutes = Math.floor(session.duration_seconds / 60);

    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Duration" value={`${durationMinutes} min`} icon={<Timer />} />

            <MetricCard
                label="Distance"
                value={`${session.distance_miles ?? 0} mi`}
                icon={<Route />}
            />

            <MetricCard
                label="Max Speed"
                value={`${session.max_speed_mph} mph`}
                icon={<Activity />}
            />

            <MetricCard
                label="Max RPM"
                value={session.max_rpm.toLocaleString()}
                icon={<Gauge />}
            />
        </section>
    );
}