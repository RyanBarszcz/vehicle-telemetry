"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

type ObdConnectionModalProps = {
    startedAt: number;
};

function formatElapsed(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}

export default function ObdConnectionModal({
    startedAt,
}: ObdConnectionModalProps) {
    const [elapsedSeconds, setElapsedSeconds] =
        useState(0);

    useEffect(() => {
        function updateElapsed() {
            setElapsedSeconds(
                Math.max(
                    0,
                    Math.floor(
                        (Date.now() - startedAt) /
                        1000
                    )
                )
            );
        }

        updateElapsed();

        const intervalId =
            window.setInterval(
                updateElapsed,
                1000
            );

        return () => {
            window.clearInterval(intervalId);
        };
    }, [startedAt]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center text-white shadow-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
                    <LoaderCircle className="h-7 w-7 animate-spin text-blue-400" />
                </div>

                <p className="mt-5 text-sm font-medium text-blue-400">
                    Vehicle connection
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                    Waiting for OBD connection
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Keep the adapter plugged in and the
                    vehicle ignition on. Connecting can take
                    up to a minute.
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                        Elapsed time
                    </p>

                    <p className="mt-1 font-mono text-xl font-semibold text-white">
                        {formatElapsed(elapsedSeconds)}
                    </p>
                </div>
            </div>
        </div>
    );
}