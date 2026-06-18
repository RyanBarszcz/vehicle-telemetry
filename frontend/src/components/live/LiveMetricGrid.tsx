import LiveMetricCard from "./LiveMetricCard";

export default function LiveMetricGrid() {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <LiveMetricCard
                label="RPM"
                value="4,280"
            />

            <LiveMetricCard
                label="Speed"
                value="68 mph"
            />

            <LiveMetricCard
                label="Throttle"
                value="74%"
            />

            <LiveMetricCard
                label="Boost"
                value="18.2 psi"
            />
        </section>
    );
}