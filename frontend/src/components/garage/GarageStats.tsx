import { Activity, Bell, Car, Route } from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";

export default function GarageStats() {
    return (
        <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Vehicles" value="2" icon={<Car />} />
            <MetricCard label="Sessions" value="14" icon={<Activity />} />
            <MetricCard label="Miles Logged" value="326" icon={<Route />} />
            <MetricCard label="Active Alerts" value="0" icon={<Bell />} />
        </section>
    );
}