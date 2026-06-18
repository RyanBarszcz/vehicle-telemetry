import SessionCard from "@/components/sessions/SessionCard";
import { mockSessions } from "@/lib/mockSessions";

type VehicleRecentSessionsProps = {
    vehicleId: string;
};

export default function VehicleRecentSessions({
    vehicleId,
}: VehicleRecentSessionsProps) {
    const sessions = mockSessions.filter(
        (session) => session.vehicleId === vehicleId
    );

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

            <div className="space-y-6">
                {sessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                ))}
            </div>
        </section>
    );
}