import { Activity, Gauge, Route, Timer } from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";

export default function VehicleOverviewStats() {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Sessions" value="8" icon={<Activity />} />
            <MetricCard label="Miles Logged" value="184" icon={<Route />} />
            <MetricCard label="Max Speed" value="87 mph" icon={<Gauge />} />
            <MetricCard label="Total Time" value="4.2 hr" icon={<Timer />} />
        </section>
    );
}