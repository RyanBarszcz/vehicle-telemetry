"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import SessionCard from "@/components/sessions/SessionCard";
import {
    DrivingSession,
    getVehicleSessions,
} from "@/lib/api";

type VehicleRecentSessionsProps = {
    vehicleId: string;
};

export default function VehicleRecentSessions({
    vehicleId,
}: VehicleRecentSessionsProps) {
    const { getToken } = useAuth();

    const [sessions, setSessions] = useState<DrivingSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSessions() {
            try {
                setLoading(true);

                const token = await getToken();

                if (!token) {
                    return;
                }

                const data = await getVehicleSessions(
                    token,
                    vehicleId
                );

                setSessions(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadSessions();
    }, [vehicleId, getToken]);

    if (loading) {
        return (
            <section>
                <h2 className="text-2xl font-semibold text-white">
                    Recent Sessions
                </h2>

                <p className="mt-4 text-sm text-zinc-400">
                    Loading sessions...
                </p>
            </section>
        );
    }

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