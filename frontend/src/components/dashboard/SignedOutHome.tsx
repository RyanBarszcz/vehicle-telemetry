import Link from "next/link";
import {
    Activity,
    BarChart3,
    CloudUpload,
    Gauge,
    Radio,
    ShieldCheck,
} from "lucide-react";

import MetricCard from "@/components/telemetry/MetricCard";
import FeatureCard from "@/components/ui/FeatureCard";

export default function SignedOutHome() {
    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            {/* Hero */}
            <section className="relative overflow-hidden px-6 pb-24 pt-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.25),_transparent_35%)]" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                            <Radio className="h-4 w-4" />
                            Real-time OBD-II vehicle data logging
                        </div>

                        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                            Turn your car into a{" "}
                            <span className="text-blue-500">
                                live telemetry system.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                            Record driving sessions, stream vehicle data,
                            analyze performance trends, and share access
                            with tuners or other drivers.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                href="/garage"
                                className="rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                            >
                                Get Started
                            </Link>

                            <Link
                                href="/live"
                                className="rounded-full border border-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                View Demo
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Live Session
                                </p>

                                <h2 className="text-xl font-semibold">
                                    Stage 1 GTI
                                </h2>
                            </div>

                            <div className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                                Connected
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <MetricCard
                                label="RPM"
                                value="4,280"
                                icon={<Gauge />}
                            />

                            <MetricCard
                                label="Speed"
                                value="68 mph"
                                icon={<Activity />}
                            />

                            <MetricCard
                                label="Throttle"
                                value="74%"
                                icon={<BarChart3 />}
                            />

                            <MetricCard
                                label="Boost"
                                value="18.2 psi"
                                icon={<CloudUpload />}
                            />
                        </div>

                        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-zinc-300">
                                    RPM / Speed Stream
                                </p>

                                <p className="text-xs text-zinc-500">
                                    Live
                                </p>
                            </div>

                            <div className="flex h-40 items-end gap-2">
                                {[
                                    35, 55, 42, 70, 62, 85,
                                    76, 95, 68, 80, 72, 90,
                                ].map((height, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 rounded-t bg-blue-500/80"
                                        style={{ height: `${height}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 pb-24">
                <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
                    <FeatureCard
                        icon={<Radio />}
                        title="Live Telemetry"
                        description="Stream RPM, speed, throttle, temperatures, boost, and other vehicle metrics in real time."
                    />

                    <FeatureCard
                        icon={<CloudUpload />}
                        title="Offline Sync"
                        description="Log locally when connection drops, then sync driving sessions to the cloud when service returns."
                    />

                    <FeatureCard
                        icon={<ShieldCheck />}
                        title="Tuner Sharing"
                        description="Share vehicle access with tuners, friends, or other drivers for remote diagnostics and analysis."
                    />
                </div>
            </section>
        </main>
    );
}