import SessionHeader from "@/components/sessions/SessionHeader";
import SessionStats from "@/components/sessions/SessionStats";
import SessionChart from "@/components/sessions/SessionChart";

export default function SessionPage() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <SessionHeader />

                <SessionStats />

                <SessionChart />
            </div>
        </main>
    );
}