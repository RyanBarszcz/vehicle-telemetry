import LiveHeader from "@/components/live/LiveHeader";
import LiveMetricGrid from "@/components/live/LiveMetricGrid";
import TelemetryStream from "@/components/live/TelemetryStream";

export default function LivePage() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <LiveHeader />

                <LiveMetricGrid />

                <TelemetryStream />
            </div>
        </main>
    );
}