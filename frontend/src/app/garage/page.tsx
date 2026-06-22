"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import GarageHeader from "@/components/garage/GarageHeader";
import GarageStats from "@/components/garage/GarageStats";
import VehicleCard from "@/components/garage/VehicleCard";
import { getVehicles } from "@/lib/api";
import type { Vehicle } from "@/types/vehicle";

export default function GaragePage() {
    const { getToken } = useAuth();

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadVehicles() {
            try {
                setLoading(true);
                setError("");

                const token = await getToken();

                if (!token) {
                    setError("Not authenticated.");
                    return;
                }

                const data = await getVehicles(token);
                setVehicles(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load vehicles.");
            } finally {
                setLoading(false);
            }
        }

        loadVehicles();
    }, [getToken]);

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <GarageHeader />

                <GarageStats vehicleCount={vehicles.length} />

                <section>
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Connected Vehicles</h2>
                            <p className="mt-1 text-sm text-zinc-400">
                                Select a vehicle to view sessions, telemetry, and analytics.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-sm text-zinc-400">Loading vehicles...</p>
                    ) : error ? (
                        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </p>
                    ) : vehicles.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
                            <h3 className="text-xl font-semibold text-white">
                                No vehicles yet
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400">
                                Add your first vehicle to start logging sessions and telemetry.
                            </p>

                            <Link
                                href="/garage/new"
                                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                            >
                                Add Vehicle
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {vehicles.map((vehicle) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}