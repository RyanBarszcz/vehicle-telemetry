"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { formatDuration } from "@/lib/formatters";

type EndSessionModalProps = {
    defaultTitle?: string | null;
    durationSeconds: number;
    distanceMiles?: number | null;
    maxSpeedMph: number;
    avgSpeedMph?: number | null;
    maxRpm: number;
    saving: boolean;
    onCancel: () => void;
    onSave: (title: string) => void;
};

export default function EndSessionModal({
    defaultTitle,
    durationSeconds,
    distanceMiles,
    maxSpeedMph,
    avgSpeedMph,
    maxRpm,
    saving,
    onCancel,
    onSave,
}: EndSessionModalProps) {
    const [title, setTitle] = useState(
        defaultTitle || `Drive ${new Date().toLocaleDateString()}`
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            Save Driving Session
                        </p>
                        <h2 className="mt-2 text-2xl font-bold">
                            Name this session
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Your telemetry capture has stopped. Add a name before saving
                            this drive to your history.
                        </p>
                    </div>

                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <label className="text-sm font-medium text-zinc-300">
                    Session name
                </label>

                <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Evening canyon drive"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
                />

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/[0.04] p-4">
                        <p className="text-xs text-zinc-500">Duration</p>
                        <p className="mt-1 font-semibold">
                            {formatDuration(durationSeconds)}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-4">
                        <p className="text-xs text-zinc-500">Distance</p>
                        <p className="mt-1 font-semibold">
                            {distanceMiles ? `${distanceMiles.toFixed(1)} mi` : "—"}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-4">
                        <p className="text-xs text-zinc-500">Max Speed</p>
                        <p className="mt-1 font-semibold">{maxSpeedMph} mph</p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-4">
                        <p className="text-xs text-zinc-500">Max RPM</p>
                        <p className="mt-1 font-semibold">
                            {maxRpm.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSave(title)}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? "Saving..." : "Save Session"}
                    </button>
                </div>
            </div>
        </div>
    );
}