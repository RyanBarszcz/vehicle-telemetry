import Link from "next/link";
import { Plus } from "lucide-react";

export default function GarageHeader() {
    return (
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
                <p className="text-sm font-medium text-blue-400">My Garage</p>

                <h1 className="mt-2 text-4xl font-bold text-white">
                    Your Vehicles
                </h1>

                <p className="mt-3 max-w-2xl text-zinc-400">
                    Manage connected vehicles, start telemetry sessions, and review
                    previous driving data.
                </p>
            </div>

            <Link
                href="/garage/new"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
                <Plus className="h-4 w-4" />
                Add Vehicle
            </Link>
        </section>
    );
}