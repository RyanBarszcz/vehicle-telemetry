import {
    Activity,
    Gauge,
    Route,
    Timer,
} from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";

export default function SessionStats() {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
                label="Duration"
                value="18 min"
                icon={<Timer />}
            />

            <MetricCard
                label="Distance"
                value="24.6 mi"
                icon={<Route />}
            />

            <MetricCard
                label="Max Speed"
                value="87 mph"
                icon={<Activity />}
            />

            <MetricCard
                label="Max RPM"
                value="6,420"
                icon={<Gauge />}
            />
        </section>
    );
}