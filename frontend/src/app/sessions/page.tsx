import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Gauge, Timer, Route, ArrowRight } from "lucide-react";
import { formatDuration } from "@/lib/formatters";

import { getSessions } from "@/lib/api";

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

// TODO: Make duration be seconds and minutes too
// TODO: Add a delete option


export default async function SessionsPage() {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect("/login");
    }

    const token = await getToken();

    if (!token) {
        redirect("/login");
    }

    const sessions = await getSessions(token);

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            Driving Sessions
                        </p>

                        <h1 className="mt-2 text-4xl font-bold">
                            Session History
                        </h1>

                        <p className="mt-3 max-w-2xl text-zinc-400">
                            Review every drive, compare performance over time, and dive
                            into detailed telemetry from past sessions.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                        <p className="text-sm text-zinc-400">Total Sessions</p>
                        <p className="mt-1 text-3xl font-bold">{sessions.length}</p>
                    </div>
                </div>

                {sessions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
                        <h2 className="text-2xl font-semibold text-white">
                            No driving sessions yet
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-zinc-400">
                            Start your first driving session from one of your vehicles.
                            Your telemetry, performance stats, and trip history will appear
                            here.
                        </p>

                        <Link
                            href="/garage"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                        >
                            Go to Garage
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <Link
                                key={session.id}
                                href={`/sessions/${session.id}`}
                                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/40 hover:bg-white/[0.06]"
                            >
                                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
                                                <Gauge className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <h2 className="text-xl font-semibold text-white">
                                                    {session.title || "Driving Session"}
                                                </h2>

                                                <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                                                    <CalendarDays className="h-4 w-4" />
                                                    {formatDate(session.started_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:min-w-[520px]">
                                        <div>
                                            <p className="flex items-center gap-1 text-xs text-zinc-500">
                                                <Timer className="h-3.5 w-3.5" />
                                                Duration
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {formatDuration(session.duration_seconds)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-zinc-500">
                                                Max Speed
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {session.max_speed_mph} mph
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-zinc-500">
                                                Max RPM
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {session.max_rpm.toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="flex items-center gap-1 text-xs text-zinc-500">
                                                <Route className="h-3.5 w-3.5" />
                                                Distance
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {session.distance_miles
                                                    ? `${session.distance_miles.toFixed(1)} mi`
                                                    : "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight className="hidden h-5 w-5 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-blue-400 md:block" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}