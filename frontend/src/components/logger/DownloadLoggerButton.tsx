"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

type DownloadLoggerButtonProps = {
    className?: string;
    compact?: boolean;
};

export default function DownloadLoggerButton({
    className = "",
    compact = false,
}: DownloadLoggerButtonProps) {
    const downloadUrl =
        process.env.NEXT_PUBLIC_LOGGER_DOWNLOAD_URL;

    function handleDownload() {
        if (!downloadUrl) {
            toast.error("The Windows logger download is not available yet.");
            return;
        }

        toast.success("Logger download started");
    }

    return (
        <a
            href={downloadUrl || "#"}
            download
            onClick={(event) => {
                if (!downloadUrl) {
                    event.preventDefault();
                }

                handleDownload();
            }}
            className={[
                "inline-flex items-center justify-center gap-2 font-semibold transition",
                compact
                    ? "rounded-full border border-white/10 px-6 py-3 text-sm text-white hover:bg-white/10"
                    : "rounded-xl bg-blue-600 px-5 py-3 text-sm text-white hover:bg-blue-500",
                className,
            ].join(" ")}
        >
            <Download className="h-4 w-4" />
            Download Windows Logger
        </a>
    );
}