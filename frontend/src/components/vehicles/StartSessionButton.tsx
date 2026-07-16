"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import LoggerRequiredModal from "@/components/logger/LoggerRequiredModal";
import { createVehicleSession } from "@/lib/api";
import { checkLoggerHealth } from "@/lib/loggerClient";

type StartSessionButtonProps = {
    vehicleId: string;
};

export default function StartSessionButton({
    vehicleId,
}: StartSessionButtonProps) {
    const router = useRouter();
    const { getToken } = useAuth();

    const [loggerModalOpen, setLoggerModalOpen] =
        useState(false);
    const [checkingLogger, setCheckingLogger] =
        useState(false);
    const [startingSession, setStartingSession] =
        useState(false);

    async function verifyLogger(): Promise<boolean> {
        setCheckingLogger(true);

        try {
            return await checkLoggerHealth();
        } finally {
            setCheckingLogger(false);
        }
    }

    async function createSession(): Promise<void> {
        setStartingSession(true);

        const toastId = toast.loading(
            "Creating driving session..."
        );

        try {
            const token = await getToken();

            if (!token) {
                toast.error("Please sign in.", {
                    id: toastId,
                });
                return;
            }

            const session = await createVehicleSession(
                token,
                vehicleId,
                {
                    title: "New Driving Session",
                    selected_metrics: [],
                    started_at:
                        new Date().toISOString(),
                    duration_seconds: 0,
                    distance_miles: 0,
                    max_speed_mph: 0,
                    avg_speed_mph: 0,
                    max_rpm: 0,
                }
            );

            toast.success("Session created", {
                id: toastId,
            });

            router.push(`/sessions/${session.id}`);
        } catch (error) {
            console.error(
                "Failed to create session:",
                error
            );

            toast.error("Failed to start session", {
                id: toastId,
            });
        } finally {
            setStartingSession(false);
        }
    }

    async function beginSession() {
        const loggerAvailable = await verifyLogger();

        if (!loggerAvailable) {
            setLoggerModalOpen(true);
            return;
        }

        await createSession();
    }

    async function handleRetryLogger() {
        const loggerAvailable = await verifyLogger();

        if (!loggerAvailable) {
            toast.error(
                "DriveIQ Logger is still not running."
            );
            return;
        }

        toast.success("DriveIQ Logger detected");
        setLoggerModalOpen(false);

        await createSession();
    }

    return (
        <>
            <button
                type="button"
                onClick={beginSession}
                disabled={
                    checkingLogger ||
                    startingSession
                }
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Play className="h-4 w-4" />

                {checkingLogger
                    ? "Checking Logger..."
                    : startingSession
                        ? "Starting..."
                        : "Start Session"}
            </button>

            <LoggerRequiredModal
                open={loggerModalOpen}
                checking={checkingLogger}
                onClose={() => {
                    if (!checkingLogger) {
                        setLoggerModalOpen(false);
                    }
                }}
                onRetry={handleRetryLogger}
            />
        </>
    );
}