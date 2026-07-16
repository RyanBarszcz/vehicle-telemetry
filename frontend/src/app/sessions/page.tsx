import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    CalendarDays,
    Gauge,
    Timer,
} from "lucide-react";

import DownloadSessionCsvButton from "@/components/sessions/DownloadSessionCsvButton";
import { getSessions } from "@/lib/api";
import { formatDuration } from "@/lib/formatters";

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

// TODO: Later add a delete option

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
                            Review every drive, compare performance over time,
                            and dive into detailed telemetry from past sessions.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                        <p className="text-sm text-zinc-400">
                            Total Sessions
                        </p>

                        <p className="mt-1 text-3xl font-bold">
                            {sessions.length}
                        </p>
                    </div>
                </div>

                {sessions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
                        <h2 className="text-2xl font-semibold text-white">
                            No driving sessions yet
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-zinc-400">
                            Start your first driving session from one of your
                            vehicles. Your telemetry, performance stats, and
                            trip history will appear here.
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
                            <article
                                key={session.id}
                                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-500/40 hover:bg-white/[0.06]"
                            >
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <Link
                                        href={`/sessions/${session.id}`}
                                        className="flex min-w-0 flex-1 items-center gap-4"
                                    >
                                        <div className="shrink-0 rounded-2xl bg-blue-500/10 p-3 text-blue-400">
                                            <Gauge className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-blue-400">
                                                {session.vehicle_name}
                                            </p>

                                            <h2 className="mt-1 truncate text-lg font-semibold text-white">
                                                {session.title ||
                                                    "Driving Session"}
                                            </h2>

                                            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                                                <CalendarDays className="h-4 w-4 shrink-0" />
                                                {formatDate(
                                                    session.started_at
                                                )}
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={`/sessions/${session.id}`}
                                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-blue-500/30 hover:bg-blue-500/[0.05] sm:min-w-[150px]"
                                    >
                                        <div className="rounded-xl bg-white/[0.05] p-2 text-zinc-400">
                                            <Timer className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="text-xs text-zinc-500">
                                                Duration
                                            </p>

                                            <p className="mt-0.5 font-semibold text-white">
                                                {formatDuration(
                                                    session.duration_seconds
                                                )}
                                            </p>
                                        </div>
                                    </Link>

                                    <div className="flex items-center justify-end gap-2">
                                        {session.ended_at && (
                                            <DownloadSessionCsvButton
                                                sessionId={session.id}
                                                compact
                                            />
                                        )}

                                        <Link
                                            href={`/sessions/${session.id}`}
                                            aria-label={`Open ${session.title ||
                                                "driving session"
                                                }`}
                                            className="rounded-full p-2 text-zinc-500 transition hover:bg-white/10 hover:text-blue-400"
                                        >
                                            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}