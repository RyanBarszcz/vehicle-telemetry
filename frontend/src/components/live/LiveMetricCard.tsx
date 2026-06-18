import React from "react";

type Props = {
    label: string;
    value: string;
};

export default function LiveMetricCard({
    label,
    value,
}: Props) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-zinc-400">
                {label}
            </p>

            <p className="mt-2 text-4xl font-bold text-white">
                {value}
            </p>
        </div>
    );
}