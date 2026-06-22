"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import SessionHeader from "@/components/sessions/SessionHeader";
import SessionStats from "@/components/sessions/SessionStats";
import SessionChart from "@/components/sessions/SessionChart";
import { getSession, type DrivingSession } from "@/lib/api";

export default function SessionPage() {
    const params = useParams<{ sessionId: string }>();
    const { getToken } = useAuth();

    const [session, setSession] = useState<DrivingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);

    useEffect(() => {
        async function loadSession() {
            try {
                const token = await getToken();

                if (!token) {
                    setMissing(true);
                    return;
                }

                const data = await getSession(token, params.sessionId);
                setSession(data);
            } catch (error) {
                console.error(error);
                setMissing(true);
            } finally {
                setLoading(false);
            }
        }

        loadSession();
    }, [getToken, params.sessionId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <p className="text-sm text-zinc-400">Loading session...</p>
            </main>
        );
    }

    if (missing || !session) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <SessionHeader session={session} />

                <SessionStats session={session} />

                <SessionChart />
            </div>
        </main>
    );
}