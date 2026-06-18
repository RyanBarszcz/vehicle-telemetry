import Link from "next/link";
import {
    Activity,
    BarChart3,
    Gauge,
    ShieldCheck,
} from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";
import DashboardVehicle from "./DashboardVehicle";
import DashboardSession from "./DashboardSession";

export default function SignedInHome() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <section className="flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            Vehicle Telemetry Platform
                        </p>

                        <h1 className="mt-2 text-4xl font-bold">
                            Welcome back, Ryan
                        </h1>

                        <p className="mt-3 max-w-2xl text-zinc-400">
                            Monitor your garage, start a live telemetry session,
                            or review your latest driving data.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/live"
                            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                            Start Live Session
                        </Link>

                        <Link
                            href="/garage"
                            className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Add Vehicle
                        </Link>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-4">
                    <MetricCard
                        label="Vehicles"
                        value="2"
                        icon={<Gauge />}
                    />

                    <MetricCard
                        label="Sessions"
                        value="14"
                        icon={<Activity />}
                    />

                    <MetricCard
                        label="Miles Logged"
                        value="326"
                        icon={<BarChart3 />}
                    />

                    <MetricCard
                        label="Active Alerts"
                        value="0"
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
                            <DashboardVehicle
                                name="Stage 1 GTI"
                                subtitle="2017 Volkswagen GTI SE DSG"
                                status="Ready"
                            />

                            <DashboardVehicle
                                name="Mustang GT Premium"
                                subtitle="2025 Ford Mustang GT"
                                status="Offline"
                            />
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
                            <DashboardSession
                                title="Backroad Pulls"
                                vehicle="Stage 1 GTI"
                                stats="18 min • 24.6 mi • 87 mph max"
                            />

                            <DashboardSession
                                title="Commute Log"
                                vehicle="Stage 1 GTI"
                                stats="31 min • 19.2 mi • 71 mph max"
                            />

                            <DashboardSession
                                title="Baseline Test"
                                vehicle="Mustang GT"
                                stats="12 min • 8.4 mi • 64 mph max"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}