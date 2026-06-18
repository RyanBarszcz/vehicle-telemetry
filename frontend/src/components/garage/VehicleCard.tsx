import Link from "next/link";
import { Activity, Gauge, Radio } from "lucide-react";

import type { Vehicle } from "@/types/vehicle";

type VehicleCardProps = {
    vehicle: Vehicle;
};

export default function VehicleCard({ vehicle }: VehicleCardProps) {
    const displayName =
        vehicle.nickname ?? `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    return (
        <Link
            href={`/vehicles/${vehicle.id}`}
            className="group block rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/40 hover:bg-white/[0.06]"
        >
            <div className="mb-6 flex h-44 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/80">
                <Gauge className="h-16 w-16 text-blue-500/70 transition group-hover:scale-105" />
            </div>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        {displayName}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        {vehicle.trim ? ` ${vehicle.trim}` : ""}
                    </p>
                </div>

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                    Ready
                </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-zinc-900/70 p-4">
                    <Activity className="mb-2 h-4 w-4 text-blue-400" />
                    <p className="text-xs text-zinc-500">Sessions</p>
                    <p className="mt-1 font-semibold text-white">8</p>
                </div>

                <div className="rounded-2xl bg-zinc-900/70 p-4">
                    <Radio className="mb-2 h-4 w-4 text-blue-400" />
                    <p className="text-xs text-zinc-500">Last Sync</p>
                    <p className="mt-1 font-semibold text-white">Today</p>
                </div>

                <div className="rounded-2xl bg-zinc-900/70 p-4">
                    <Gauge className="mb-2 h-4 w-4 text-blue-400" />
                    <p className="text-xs text-zinc-500">Max RPM</p>
                    <p className="mt-1 font-semibold text-white">6,420</p>
                </div>
            </div>
        </Link>
    );
}