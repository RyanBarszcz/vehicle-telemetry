"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    Download,
    LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";

import { downloadSessionCsv } from "@/lib/api";

type DownloadSessionCsvButtonProps = {
    sessionId: string;
    className?: string;
    compact?: boolean;
};

export default function DownloadSessionCsvButton({
    sessionId,
    className = "",
    compact = false,
}: DownloadSessionCsvButtonProps) {
    const { getToken } = useAuth();

    const [downloading, setDownloading] =
        useState(false);

    async function handleDownload(
        event: React.MouseEvent<HTMLButtonElement>
    ) {
        /*
         * Important when this button is inside a clickable
         * session row. It prevents the row's Link from
         * navigating to the session page.
         */
        event.preventDefault();
        event.stopPropagation();

        if (downloading) {
            return;
        }

        setDownloading(true);

        const toastId = toast.loading(
            "Preparing CSV download..."
        );

        try {
            const token = await getToken();

            if (!token) {
                throw new Error(
                    "Please sign in to download this session."
                );
            }

            const { blob, filename } =
                await downloadSessionCsv(
                    token,
                    sessionId
                );

            const objectUrl =
                URL.createObjectURL(blob);

            const anchor =
                document.createElement("a");

            anchor.href = objectUrl;
            anchor.download = filename;

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            URL.revokeObjectURL(objectUrl);

            toast.success(
                "CSV download started.",
                {
                    id: toastId,
                }
            );
        } catch (error) {
            console.error(
                "Failed to download CSV",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to download CSV.",
                {
                    id: toastId,
                }
            );
        } finally {
            setDownloading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] font-semibold text-zinc-200 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 ${compact
                ? "h-10 w-10 p-0"
                : "px-4 py-2.5 text-sm"
                } ${className}`}
            aria-label="Download session CSV"
            title="Download CSV"
        >
            {downloading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}

            {!compact && (
                <span>Download CSV</span>
            )}
        </button>
    );
}