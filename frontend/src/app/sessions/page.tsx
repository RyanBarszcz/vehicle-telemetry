import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SessionsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <p className="text-sm font-medium text-blue-400">
                        Driving History
                    </p>

                    <h1 className="mt-2 text-4xl font-bold">Sessions</h1>

                    <p className="mt-3 text-zinc-400">
                        Review previous telemetry logs, performance data, and driving
                        sessions.
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                    <h2 className="text-xl font-semibold text-white">
                        No global session history yet
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                        Start a session from a vehicle page. We’ll add a full cross-vehicle
                        session history endpoint later.
                    </p>
                </div>
            </div>
        </main>
    );
}