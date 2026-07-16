"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ArrowDownAZ, Plus } from "lucide-react";

import GarageHeader from "@/components/garage/GarageHeader";
import VehicleCard from "@/components/garage/VehicleCard";
import { getVehicles } from "@/lib/api";
import type { Vehicle } from "@/types/vehicle";

type SortOption = "name" | "newest" | "oldest";

export default function GaragePage() {
    const { getToken } = useAuth();

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("name");

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
            } catch (error) {
                console.error("Failed to load vehicles:", error);
                setError("Failed to load vehicles.");
            } finally {
                setLoading(false);
            }
        }

        void loadVehicles();
    }, [getToken]);

    const sortedVehicles = useMemo(() => {
        return [...vehicles].sort((a, b) => {
            if (sortBy === "newest") {
                return (b.year ?? 0) - (a.year ?? 0);
            }

            if (sortBy === "oldest") {
                return (a.year ?? 0) - (b.year ?? 0);
            }

            const aName =
                a.nickname ||
                `${a.make} ${a.model}`;

            const bName =
                b.nickname ||
                `${b.make} ${b.model}`;

            return aName.localeCompare(bName);
        });
    }, [vehicles, sortBy]);

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <GarageHeader />

                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-semibold">
                                    Connected Vehicles
                                </h2>

                                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-zinc-300">
                                    {vehicles.length}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-zinc-400">
                                Select a vehicle to view its sessions and
                                telemetry.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {vehicles.length > 0 && (
                                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2">
                                    <ArrowDownAZ className="h-4 w-4 text-zinc-500" />

                                    <span className="sr-only">
                                        Sort vehicles
                                    </span>

                                    <select
                                        value={sortBy}
                                        onChange={(event) =>
                                            setSortBy(
                                                event.target
                                                    .value as SortOption
                                            )
                                        }
                                        className="bg-transparent text-sm text-zinc-300 outline-none"
                                    >
                                        <option
                                            value="name"
                                            className="bg-zinc-900"
                                        >
                                            Name
                                        </option>

                                        <option
                                            value="newest"
                                            className="bg-zinc-900"
                                        >
                                            Newest
                                        </option>

                                        <option
                                            value="oldest"
                                            className="bg-zinc-900"
                                        >
                                            Oldest
                                        </option>
                                    </select>
                                </label>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 text-center">
                            <p className="text-sm text-zinc-400">
                                Loading vehicles...
                            </p>
                        </div>
                    ) : error ? (
                        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </p>
                    ) : vehicles.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 p-10 text-center">
                            <h3 className="text-xl font-semibold text-white">
                                No vehicles yet
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                                Add your first vehicle to start recording
                                driving sessions and telemetry.
                            </p>

                            <Link
                                href="/garage/new"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                            >
                                <Plus className="h-4 w-4" />
                                Add Vehicle
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {sortedVehicles.map((vehicle) => (
                                <VehicleCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}