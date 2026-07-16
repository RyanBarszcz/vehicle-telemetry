import Link from "next/link";
import {
    Activity,
    CalendarDays,
    CarFront,
} from "lucide-react";

import type { Vehicle } from "@/types/vehicle";

type VehicleCardProps = {
    vehicle: Vehicle;
};

export default function VehicleCard({
    vehicle,
}: VehicleCardProps) {
    const displayName =
        vehicle.nickname ||
        `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    const subtitle = [
        vehicle.year,
        vehicle.make,
        vehicle.model,
        vehicle.trim,
    ]
        .filter(Boolean)
        .join(" ");

    const lastSessionLabel = vehicle.last_session_at
        ? new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(vehicle.last_session_at))
        : "No sessions yet";

    return (
        <Link
            href={`/vehicles/${vehicle.id}`}
            className="group block rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-500/40 hover:bg-white/[0.06]"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <CarFront className="h-7 w-7 transition group-hover:scale-105" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-semibold text-white">
                                {displayName}
                            </h2>

                            <p className="mt-1 truncate text-sm text-zinc-400">
                                {subtitle}
                            </p>
                        </div>

                        <span className="shrink-0 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
                            Ready
                        </span>
                    </div>

                    {vehicle.vin && (
                        <p className="mt-2 truncate text-xs text-zinc-500">
                            VIN: {vehicle.vin}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-zinc-900/70 p-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Activity className="h-4 w-4 text-blue-400" />

                        <p className="text-xs">
                            Sessions
                        </p>
                    </div>

                    <p className="mt-2 text-lg font-semibold text-white">
                        {vehicle.session_count ?? 0}
                    </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-zinc-900/70 p-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <CalendarDays className="h-4 w-4 text-blue-400" />

                        <p className="text-xs">
                            Last Session
                        </p>
                    </div>

                    <p className="mt-2 truncate text-sm font-semibold text-white">
                        {lastSessionLabel}
                    </p>
                </div>
            </div>
        </Link>
    );
}