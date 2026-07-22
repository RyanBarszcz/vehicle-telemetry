"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import VehicleDetailHeader from "@/components/vehicles/VehicleDetailHeader";
import VehicleOverviewStats from "@/components/vehicles/VehicleOverviewStats";
import VehicleRecentSessions from "@/components/vehicles/VehicleRecentSessions";

import {
    getVehicle,
    getVehicleSessions,
    type DrivingSession,
} from "@/lib/api";

import type { Vehicle } from "@/types/vehicle";

export default function VehiclePage() {
    const { vehicleId } = useParams<{ vehicleId: string }>();
    const { getToken } = useAuth();

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [sessions, setSessions] = useState<DrivingSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);

    useEffect(() => {
        async function loadVehiclePage() {
            try {
                const token = await getToken();

                if (!token) {
                    setMissing(true);
                    return;
                }

                const [vehicleData, sessionData] = await Promise.all([
                    getVehicle(token, vehicleId),
                    getVehicleSessions(token, vehicleId),
                ]);

                setVehicle(vehicleData);
                setSessions(sessionData);
            } catch (error) {
                console.error("Failed to load vehicle page:", error);
                setMissing(true);
            } finally {
                setLoading(false);
            }
        }

        loadVehiclePage();
    }, [getToken, vehicleId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm text-zinc-400">
                        Loading vehicle...
                    </p>
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

                <VehicleRecentSessions sessions={sessions} />
            </div>
        </main>
    );
}