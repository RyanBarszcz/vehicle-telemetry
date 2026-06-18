import AlertCard from "@/components/alerts/AlertCard";
import AlertsHeader from "@/components/alerts/AlertsHeader";
import { mockAlerts } from "@/lib/mockAlerts";

export default function AlertsPage() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <AlertsHeader />

                <section className="grid gap-6 lg:grid-cols-2">
                    {mockAlerts.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))}
                </section>
            </div>
        </main>
    );
}