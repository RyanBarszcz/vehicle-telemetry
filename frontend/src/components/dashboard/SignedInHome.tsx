"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Activity, BarChart3, Gauge, ShieldCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import MetricCard from "@/components/telemetry/MetricCard";
import DashboardVehicle from "./DashboardVehicle";
import DashboardSession from "./DashboardSession";
import { getDashboardSummary, type DashboardSummary } from "@/lib/api";

export default function SignedInHome() {
    const { getToken } = useAuth();
    const { user, isLoaded } = useUser();

    const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function loadDashboard() {
            try {
                const token = await getToken();

                if (!token) return;

                const data = await getDashboardSummary(token);
                setDashboard(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [getToken]);

    if (loading) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <p className="text-sm text-zinc-400">Loading dashboard...</p>
            </main>
        );
    }

    if (!dashboard) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <p className="text-sm text-zinc-400">
                    Unable to load dashboard.
                </p>
            </main>
        );
    }


    if (!isLoaded) return null;

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <section className="flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            Vehicle Telemetry Platform
                        </p>

                        <h1 className="mt-2 text-4xl font-bold">
                            Welcome back, {user?.firstName}.
                        </h1>

                        <p className="mt-3 max-w-2xl text-zinc-400">
                            Monitor your garage, start a live telemetry session,
                            or review your latest driving data.
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

                <section className="mt-8 grid gap-4 md:grid-cols-4">
                    <MetricCard
                        label="Vehicles"
                        value={dashboard.vehicle_count.toString()}
                        icon={<Gauge />}
                    />

                    <MetricCard
                        label="Sessions"
                        value={dashboard.session_count.toString()}
                        icon={<Activity />}
                    />

                    <MetricCard
                        label="Miles Logged"
                        value={dashboard.miles_logged.toFixed(1)}
                        icon={<BarChart3 />}
                    />

                    <MetricCard
                        label="Active Alerts"
                        value={dashboard.active_alert_count.toString()}
                        icon={<ShieldCheck />}
                    />
                </section>

                <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    Your Garage
                                </h2>

                                <p className="mt-1 text-sm text-zinc-400">
                                    Vehicles connected to your account.
                                </p>
                            </div>

                            <Link
                                href="/garage"
                                className="text-sm font-medium text-blue-400 hover:text-blue-300"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {dashboard.vehicles.length === 0 ? (
                                <p className="text-sm text-zinc-400">
                                    No vehicles yet. Add your first vehicle to
                                    start logging sessions.
                                </p>
                            ) : (
                                dashboard.vehicles.map((vehicle) => (
                                    <DashboardVehicle
                                        key={vehicle.id}
                                        name={vehicle.name}
                                        subtitle={`${vehicle.year ?? ""} ${vehicle.make
                                            } ${vehicle.model}`}
                                        status="Ready"
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5">
                            <h2 className="text-2xl font-semibold">
                                Recent Sessions
                            </h2>

                            <p className="mt-1 text-sm text-zinc-400">
                                Latest driving logs and analytics.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {dashboard.recent_sessions.length === 0 ? (
                                <p className="text-sm text-zinc-400">
                                    No sessions yet. Start a session from your
                                    garage.
                                </p>
                            ) : (
                                dashboard.recent_sessions.map((session) => (
                                    <DashboardSession
                                        key={session.id}
                                        title={session.title}
                                        vehicle={session.vehicle_name}
                                        stats={`${Math.floor(
                                            session.duration_seconds / 60
                                        )} min • ${session.distance_miles?.toFixed(1) ??
                                        "0.0"
                                            } mi • ${Math.round(
                                                session.max_speed_mph
                                            )} mph max`}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}