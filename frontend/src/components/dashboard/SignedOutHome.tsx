import Link from "next/link";
import {
    Activity,
    BarChart3,
    Bluetooth,
    Car,
    CloudUpload,
    Download,
    Gauge,
    History,
    MapPinned,
    Radio,
    Share2,
    Sparkles,
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
                            Connect to your vehicle through OBD-II, record
                            driving sessions, monitor live engine data, and
                            review detailed telemetry after every drive.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                href="/sign-up"
                                className="rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                            >
                                Get Started
                            </Link>

                            <Link
                                href="/login"
                                className="rounded-full border border-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Sign In
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
                                    Live RPM stream
                                </p>

                                <p className="text-xs text-zinc-500">
                                    Updating now
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
                                        style={{
                                            height: `${height}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current features */}
            <section className="px-6 pb-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10">
                        <p className="text-sm font-medium text-blue-400">
                            Built today
                        </p>

                        <h2 className="mt-2 text-3xl font-bold">
                            Everything needed to record and review a drive
                        </h2>

                        <p className="mt-3 max-w-2xl text-zinc-400">
                            The platform connects vehicle hardware, live data,
                            cloud storage, and historical analysis in one
                            workflow.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            icon={<Car />}
                            title="Vehicle Garage"
                            description="Add and manage vehicles from one garage before starting a telemetry session."
                        />

                        <FeatureCard
                            icon={<Radio />}
                            title="Live Telemetry"
                            description="Stream RPM, speed, throttle, coolant temperature, boost, and other supported OBD-II metrics."
                        />

                        <FeatureCard
                            icon={<Gauge />}
                            title="Custom Tracking"
                            description="Choose which supported metrics to monitor and reorder live charts during a session."
                        />

                        <FeatureCard
                            icon={<History />}
                            title="Session History"
                            description="Review completed drives with timestamps, duration, vehicle information, and recorded telemetry."
                        />

                        <FeatureCard
                            icon={<BarChart3 />}
                            title="Historical Charts"
                            description="Open a completed session and analyze its recorded telemetry through full-width interactive charts."
                        />

                        <FeatureCard
                            icon={<Download />}
                            title="CSV Export"
                            description="Download recorded session data as a CSV for deeper analysis, comparison, or external tooling."
                        />
                    </div>
                </div>
            </section>

            {/* Workflow */}
            <section className="border-y border-white/10 bg-white/[0.02] px-6 py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10">
                        <p className="text-sm font-medium text-blue-400">
                            One complete workflow
                        </p>

                        <h2 className="mt-2 text-3xl font-bold">
                            From OBD connection to historical analysis
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                number: "01",
                                title: "Add a vehicle",
                                description:
                                    "Create a garage entry for the car you want to monitor.",
                            },
                            {
                                number: "02",
                                title: "Start a session",
                                description:
                                    "Connect the OBD-II logger and choose the telemetry you want to track.",
                            },
                            {
                                number: "03",
                                title: "Record live data",
                                description:
                                    "Watch incoming vehicle data update across live charts.",
                            },
                            {
                                number: "04",
                                title: "Review the drive",
                                description:
                                    "Open the completed session, inspect charts, and export the CSV.",
                            },
                        ].map((step) => (
                            <div
                                key={step.number}
                                className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6"
                            >
                                <p className="text-sm font-semibold text-blue-400">
                                    {step.number}
                                </p>

                                <h3 className="mt-4 text-xl font-semibold">
                                    {step.title}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-zinc-400">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Future features */}
            <section className="px-6 py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10">
                        <p className="text-sm font-medium text-blue-400">
                            Planned improvements
                        </p>

                        <h2 className="mt-2 text-3xl font-bold">
                            Future features
                        </h2>

                        <p className="mt-3 max-w-2xl text-zinc-400">
                            The current version focuses on reliable vehicle
                            logging and analysis. These features are planned
                            for future releases.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard
                            icon={<Share2 />}
                            title="Vehicle Sharing"
                            description="Give tuners, friends, or additional drivers controlled access to a vehicle and its sessions."
                        />

                        <FeatureCard
                            icon={<MapPinned />}
                            title="GPS Routes"
                            description="Record route data alongside vehicle telemetry and visualize each drive on a map."
                        />

                        <FeatureCard
                            icon={<Bluetooth />}
                            title="Bluetooth Logging"
                            description="Support wireless OBD-II adapters and mobile-friendly logging workflows."
                        />

                        <FeatureCard
                            icon={<Sparkles />}
                            title="Driving Insights"
                            description="Generate automated summaries that highlight unusual readings, performance trends, and key moments."
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 pb-24">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl border border-blue-500/20 bg-blue-500/10 p-8 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-3xl font-bold">
                            Start recording real vehicle data
                        </h2>

                        <p className="mt-3 max-w-2xl text-zinc-300">
                            Add a vehicle, connect the logger, and turn your
                            next drive into a complete telemetry session.
                        </p>
                    </div>

                    <Link
                        href="/sign-up"
                        className="shrink-0 rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                        Create Account
                    </Link>
                </div>
            </section>
        </main>
    );
}