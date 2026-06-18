import Link from "next/link";
import { Play, Settings } from "lucide-react";

import type { Vehicle } from "@/types/vehicle";

type VehicleDetailHeaderProps = {
    vehicle: Vehicle;
};

export default function VehicleDetailHeader({
    vehicle,
}: VehicleDetailHeaderProps) {
    const displayName =
        vehicle.nickname ?? `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-blue-400">
                        Vehicle Overview
                    </p>

                    <h1 className="mt-2 text-4xl font-bold text-white">
                        {displayName}
                    </h1>

                    <p className="mt-2 text-zinc-400">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        {vehicle.trim ? ` ${vehicle.trim}` : ""}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/live"
                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                        <Play className="h-4 w-4" />
                        Start Session
                    </Link>

                    <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                        <Settings className="h-4 w-4" />
                        Manage
                    </button>
                </div>
            </div>
        </section>
    );
}