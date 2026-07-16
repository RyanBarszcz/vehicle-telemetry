"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

import DashboardSession from "./DashboardSession";
import DashboardVehicle from "./DashboardVehicle";
import {
    getDashboardSummary,
    type DashboardSummary,
} from "@/lib/api";
import { formatDuration } from "@/lib/formatters";

export default function SignedInHome() {
    const { getToken } = useAuth();
    const { user, isLoaded: isUserLoaded } = useUser();

    const [dashboard, setDashboard] =
        useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const token = await getToken();

                if (!token) {
                    setDashboard(null);
                    return;
                }

                const data = await getDashboardSummary(token);
                setDashboard(data);
            } catch (error) {
                console.error("Failed to load dashboard:", error);
                setDashboard(null);
            } finally {
                setLoading(false);
            }
        }

        void loadDashboard();
    }, [getToken]);

    if (loading || !isUserLoaded) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm text-zinc-400">
                        Loading dashboard...
                    </p>
                </div>
            </main>
        );
    }

    if (!dashboard) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                        <h1 className="text-2xl font-semibold">
                            Unable to load dashboard
                        </h1>

                        <p className="mt-2 text-sm text-zinc-400">
                            Refresh the page and try again.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    const firstName = user?.firstName || "Driver";

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <section className="flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            Vehicle Telemetry Platform
                        </p>

                        <h1 className="mt-2 text-4xl font-bold">
                            Welcome back, {firstName}.
                        </h1>

                        <p className="mt-3 max-w-2xl text-zinc-400">
                            Monitor your garage, start a live telemetry
                            session, or review your latest driving data.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/garage"
                            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                            Start Session
                        </Link>

                        <Link
                            href="/garage/new"
                            className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Add Vehicle
                        </Link>
                    </div>
                </section>

                <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-semibold">
                                        Your Garage
                                    </h2>

                                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-zinc-300">
                                        {dashboard.vehicle_count}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-zinc-400">
                                    Vehicles connected to your account.
                                </p>
                            </div>

                            <Link
                                href="/garage"
                                className="shrink-0 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {dashboard.vehicles.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 p-6">
                                    <p className="text-sm text-zinc-400">
                                        No vehicles yet. Add your first
                                        vehicle to start logging sessions.
                                    </p>

                                    <Link
                                        href="/garage/new"
                                        className="mt-4 inline-flex text-sm font-medium text-blue-400 transition hover:text-blue-300"
                                    >
                                        Add a vehicle
                                    </Link>
                                </div>
                            ) : (
                                dashboard.vehicles.map((vehicle) => (
                                    <Link
                                        key={vehicle.id}
                                        href={`/vehicles/${vehicle.id}`}
                                        className="block rounded-2xl transition hover:bg-white/[0.03]"
                                    >
                                        <DashboardVehicle
                                            name={vehicle.name}
                                            subtitle={[
                                                vehicle.year,
                                                vehicle.make,
                                                vehicle.model,
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                            status="Ready"
                                        />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-semibold">
                                        Recent Sessions
                                    </h2>

                                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-zinc-300">
                                        {dashboard.session_count}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-zinc-400">
                                    Your latest completed driving logs.
                                </p>
                            </div>

                            <Link
                                href="/sessions"
                                className="shrink-0 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {dashboard.recent_sessions.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 p-6">
                                    <p className="text-sm text-zinc-400">
                                        No sessions yet. Start a session
                                        from your garage.
                                    </p>

                                    <Link
                                        href="/garage"
                                        className="mt-4 inline-flex text-sm font-medium text-blue-400 transition hover:text-blue-300"
                                    >
                                        Open garage
                                    </Link>
                                </div>
                            ) : (
                                dashboard.recent_sessions.map((session) => (
                                    <Link
                                        key={session.id}
                                        href={`/sessions/${session.id}`}
                                        className="block rounded-2xl transition hover:bg-white/[0.03]"
                                    >
                                        <DashboardSession
                                            title={
                                                session.title ||
                                                "Driving Session"
                                            }
                                            vehicle={
                                                session.vehicle_name
                                            }
                                            stats={formatDuration(
                                                session.duration_seconds
                                            )}
                                        />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}