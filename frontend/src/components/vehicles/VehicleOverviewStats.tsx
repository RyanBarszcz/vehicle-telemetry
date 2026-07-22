import { Activity, Timer } from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";
import type { DrivingSession } from "@/lib/api";

type VehicleOverviewStatsProps = {
    sessions?: DrivingSession[];
};

export default function VehicleOverviewStats({
    sessions = [],
}: VehicleOverviewStatsProps) {
    const totalSeconds = sessions.reduce(
        (sum, session) => sum + session.duration_seconds,
        0
    );

    const totalHours = (totalSeconds / 3600).toFixed(1);

    return (
        <section className="grid gap-4 md:grid-cols-2">
            <MetricCard
                label="Sessions"
                value={sessions.length.toString()}
                icon={<Activity />}
            />

            <MetricCard
                label="Driving Time"
                value={`${totalHours} hr`}
                icon={<Timer />}
            />
        </section>
    );
}