import SessionCard from "@/components/sessions/SessionCard";
import type { DrivingSession } from "@/lib/api";

type VehicleRecentSessionsProps = {
    sessions: DrivingSession[];
};

export default function VehicleRecentSessions({
    sessions,
}: VehicleRecentSessionsProps) {
    return (
        <section>
            <div className="mb-5">
                <h2 className="text-2xl font-semibold text-white">
                    Recent Sessions
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                    Review recent telemetry logs for this vehicle.
                </p>
            </div>

            {sessions.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <p className="text-sm text-zinc-400">
                        No sessions recorded yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {sessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}