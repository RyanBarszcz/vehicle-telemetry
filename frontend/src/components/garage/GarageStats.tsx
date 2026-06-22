import { Activity, Bell, Car, Route } from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";

type GarageStatsProps = {
    vehicleCount: number;
};

export default function GarageStats({
    vehicleCount,
}: GarageStatsProps) {
    return (
        <section className="grid gap-4 md:grid-cols-4">
            <MetricCard
                label="Vehicles"
                value={vehicleCount.toString()}
                icon={<Car />}
            />

            <MetricCard
                label="Sessions"
                value="0"
                icon={<Activity />}
            />

            <MetricCard
                label="Miles Logged"
                value="0"
                icon={<Route />}
            />

            <MetricCard
                label="Active Alerts"
                value="0"
                icon={<Bell />}
            />
        </section>
    );
}