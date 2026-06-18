import React from "react";

type MetricCardProps = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

export default function MetricCard({
    label,
    value,
    icon,
}: MetricCardProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                {icon}
            </div>

            <p className="text-sm text-zinc-400">{label}</p>

            <p className="mt-1 text-2xl font-bold">
                {value}
            </p>
        </div>
    );
}