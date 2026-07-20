"use client";

import {
    Download,
    ExternalLink,
    Loader2,
    RefreshCw,
    X,
} from "lucide-react";

type LoggerRequiredModalProps = {
    open: boolean;
    checking: boolean;
    onClose: () => void;
    onRetry: () => void;
};

export default function LoggerRequiredModal({
    open,
    checking,
    onClose,
    onRetry,
}: LoggerRequiredModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            DriveIQ Logger
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold text-white">
                            Logger not detected
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-full p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-400">
                    DriveIQ needs the local logger application to communicate
                    with your USB OBD-II adapter.
                </p>

                <div className="mt-6 space-y-3">
                    <InstructionStep
                        number="1"
                        title="Connect your adapter"
                        description="Plug the USB OBD-II adapter into the vehicle and your computer."
                    />

                    <InstructionStep
                        number="2"
                        title="Start DriveIQ Logger"
                        description="Open the DriveIQ Logger program and leave it running during the session."
                    />

                    <InstructionStep
                        number="3"
                        title="Check the connection"
                        description="Return here and select Check Again."
                    />
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-white">
                        Do not have the logger installed?
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                        Download the Windows companion application before
                        starting a session.
                    </p>

                    <a
                        href={process.env.NEXT_PUBLIC_LOGGER_DOWNLOAD_URL}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                    >
                        <Download className="h-4 w-4" />
                        Download DriveIQ Logger
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={checking}
                        className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onRetry}
                        disabled={checking}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {checking ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4" />
                                Check Again
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function InstructionStep({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-400">
                {number}
            </div>

            <div>
                <p className="text-sm font-medium text-white">
                    {title}
                </p>

                <p className="mt-1 text-sm leading-5 text-zinc-400">
                    {description}
                </p>
            </div>
        </div>
    );
}