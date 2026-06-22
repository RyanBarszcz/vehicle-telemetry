import { Activity, Gauge, Route, Timer } from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";
import type { DrivingSession } from "@/lib/api";

type VehicleOverviewStatsProps = {
    sessions?: DrivingSession[];
};

export default function VehicleOverviewStats({
    sessions = [],
}: VehicleOverviewStatsProps) {
    const sessionCount = sessions.length;

    const milesLogged = sessions.reduce(
        (sum, session) =>
            sum + (session.distance_miles ?? 0),
        0
    );

    const maxSpeed = sessions.reduce(
        (max, session) =>
            Math.max(max, session.max_speed_mph),
        0
    );

    const totalSeconds = sessions.reduce(
        (sum, session) =>
            sum + session.duration_seconds,
        0
    );

    const totalHours = (
        totalSeconds / 3600
    ).toFixed(1);

    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
                label="Sessions"
                value={sessionCount.toString()}
                icon={<Activity />}
            />

            <MetricCard
                label="Miles Logged"
                value={milesLogged.toFixed(0)}
                icon={<Route />}
            />

            <MetricCard
                label="Max Speed"
                value={
                    maxSpeed > 0
                        ? `${maxSpeed.toFixed(0)} mph`
                        : "—"
                }
                icon={<Gauge />}
            />

            <MetricCard
                label="Total Time"
                value={`${totalHours} hr`}
                icon={<Timer />}
            />
        </section>
    );
}