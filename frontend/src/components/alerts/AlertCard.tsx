import { Bell, BellOff } from "lucide-react";

import type { VehicleAlert } from "@/lib/mockAlerts";

type AlertCardProps = {
    alert: VehicleAlert;
};

export default function AlertCard({ alert }: AlertCardProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                        {alert.enabled ? (
                            <Bell className="h-5 w-5" />
                        ) : (
                            <BellOff className="h-5 w-5" />
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {alert.title}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                            {alert.vehicleName}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            {alert.description}
                        </p>
                    </div>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${alert.enabled
                        ? "bg-green-500/10 text-green-400"
                        : "bg-zinc-500/10 text-zinc-400"
                        }`}
                >
                    {alert.enabled ? "Enabled" : "Disabled"}
                </span>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs text-zinc-500">Threshold</p>
                <p className="mt-1 text-lg font-semibold text-white">
                    {alert.threshold}
                </p>
            </div>
        </div>
    );
}