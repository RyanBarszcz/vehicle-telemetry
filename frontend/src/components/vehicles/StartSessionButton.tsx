"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import { createVehicleSession } from "@/lib/api";

type StartSessionButtonProps = {
    vehicleId: string;
};

export default function StartSessionButton({
    vehicleId,
}: StartSessionButtonProps) {
    const router = useRouter();
    const { getToken } = useAuth();

    async function handleStartSession() {
        const toastId = toast.loading("Starting session...");

        try {
            const token = await getToken();

            if (!token) {
                toast.error("Please sign in.", { id: toastId });
                return;
            }

            const session = await createVehicleSession(token, vehicleId, {
                title: "New Driving Session",
                started_at: new Date().toISOString(),
                duration_seconds: 0,
                distance_miles: 0,
                max_speed_mph: 0,
                avg_speed_mph: 0,
                max_rpm: 0,
            });

            toast.success("Session started", { id: toastId });

            router.push(`/sessions/${session.id}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to start session", { id: toastId });
        }
    }

    return (
        <button
            onClick={handleStartSession}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
            <Play className="h-4 w-4" />
            Start Session
        </button>
    );
}