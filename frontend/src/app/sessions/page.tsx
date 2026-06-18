import SessionCard from "@/components/sessions/SessionCard";
import { mockSessions } from "@/lib/mockSessions";

export default function SessionsPage() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <p className="text-sm font-medium text-blue-400">
                        Driving History
                    </p>

                    <h1 className="mt-2 text-4xl font-bold">
                        Sessions
                    </h1>

                    <p className="mt-3 text-zinc-400">
                        Review previous telemetry logs,
                        performance data, and driving sessions.
                    </p>
                </div>

                <div className="space-y-6">
                    {mockSessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}