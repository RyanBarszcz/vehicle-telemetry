"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import VehicleDetailHeader from "@/components/vehicles/VehicleDetailHeader";
import VehicleOverviewStats from "@/components/vehicles/VehicleOverviewStats";
import VehicleRecentSessions from "@/components/vehicles/VehicleRecentSessions";
import { getVehicle, getVehicleSessions, type DrivingSession } from "@/lib/api";
import type { Vehicle } from "@/types/vehicle";

export default function VehiclePage() {
    const params = useParams<{ vehicleId: string }>();
    const { getToken } = useAuth();

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);
    const [sessions, setSessions] = useState<DrivingSession[]>([]);

    useEffect(() => {
        async function loadVehicle() {
            try {
                setLoading(true);

                const token = await getToken();

                if (!token) {
                    setMissing(true);
                    return;
                }

                const vehicleData = await getVehicle(token, params.vehicleId);
                const sessionData = await getVehicleSessions(token, params.vehicleId);

                setVehicle(vehicleData);
                setSessions(sessionData);
            } catch (error) {
                console.error(error);
                setMissing(true);
            } finally {
                setLoading(false);
            }
        }

        loadVehicle();
    }, [getToken, params.vehicleId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm text-zinc-400">Loading vehicle...</p>
                </div>
            </main>
        );
    }

    if (missing || !vehicle) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <VehicleDetailHeader vehicle={vehicle} />

                <VehicleOverviewStats sessions={sessions} />

                <VehicleRecentSessions vehicleId={vehicle.id} />
            </div>
        </main>
    );
}