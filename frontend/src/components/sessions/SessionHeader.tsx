import type { DrivingSession } from "@/lib/api";

type SessionHeaderProps = {
    session: DrivingSession;
};

export default function SessionHeader({ session }: SessionHeaderProps) {
    const durationMinutes = Math.floor(session.duration_seconds / 60);

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h1 className="text-2xl font-bold text-white">{session.title}</h1>

            <p className="mt-1 text-sm text-zinc-400">
                {new Date(session.started_at).toLocaleDateString()} •{" "}
                {durationMinutes} Minutes
            </p>
        </section>
    );
}