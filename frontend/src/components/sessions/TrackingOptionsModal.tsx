"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
    defaultTrackedMetrics,
    telemetryMetrics,
    type TelemetryMetricKey,
} from "@/lib/telemetryMetrics";

type Props = {
    onConfirm: (metrics: TelemetryMetricKey[]) => void;
};

const metricKeys = Object.keys(telemetryMetrics) as TelemetryMetricKey[];

export default function TrackingOptionsModal({ onConfirm }: Props) {
    const [selected, setSelected] =
        useState<TelemetryMetricKey[]>(defaultTrackedMetrics);

    function toggleMetric(metric: TelemetryMetricKey) {
        setSelected((prev) =>
            prev.includes(metric)
                ? prev.filter((item) => item !== metric)
                : [...prev, metric]
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
                <p className="text-sm font-medium text-blue-400">
                    Tracking Setup
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                    What do you want to track?
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                    Choose the telemetry channels you want shown during this session.
                    You can organize the charts after confirming.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {metricKeys.map((key) => {
                        const metric = telemetryMetrics[key];
                        const Icon = metric.icon;
                        const active = selected.includes(key);

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleMetric(key)}
                                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${active
                                    ? "border-blue-500/50 bg-blue-500/10"
                                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-white/10 p-2">
                                        <Icon className="h-5 w-5 text-blue-400" />
                                    </div>

                                    <div>
                                        <p className="font-semibold">
                                            {metric.label}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {metric.unit}
                                        </p>
                                    </div>
                                </div>

                                {active && (
                                    <Check className="h-5 w-5 text-blue-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    disabled={selected.length === 0}
                    onClick={() => onConfirm(selected)}
                    className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Start Tracking
                </button>
            </div>
        </div>
    );
}