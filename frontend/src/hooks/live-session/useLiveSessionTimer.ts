"use client";

import {
    useEffect,
    useRef,
} from "react";

import type {
    Dispatch,
    SetStateAction,
} from "react";

import type {
    LiveSessionStats,
} from "@/types/telemetry";


type UseLiveSessionTimerInput = {
    enabled: boolean;
    initialDurationSeconds: number;
    setLiveStats: Dispatch<
        SetStateAction<LiveSessionStats>
    >;
};


export function useLiveSessionTimer({
    enabled,
    initialDurationSeconds,
    setLiveStats,
}: UseLiveSessionTimerInput) {
    /*
     * performance.now() is monotonic.
     *
     * Changing the computer's system clock will therefore
     * not cause the live drive timer to jump.
     */
    const timerStartedAtRef =
        useRef<number | null>(null);


    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (
            timerStartedAtRef.current ===
            null
        ) {
            timerStartedAtRef.current =
                performance.now() -
                initialDurationSeconds * 1000;
        }

        const intervalId =
            window.setInterval(() => {
                const timerStartedAt =
                    timerStartedAtRef.current;

                if (
                    timerStartedAt === null
                ) {
                    return;
                }

                const elapsedSeconds =
                    Math.max(
                        0,
                        Math.floor(
                            (
                                performance.now() -
                                timerStartedAt
                            ) / 1000
                        )
                    );

                setLiveStats(
                    (previousStats) => ({
                        ...previousStats,

                        duration_seconds:
                            elapsedSeconds,
                    })
                );
            }, 1000);

        return () => {
            window.clearInterval(
                intervalId
            );
        };

    }, [
        enabled,
        initialDurationSeconds,
        setLiveStats,
    ]);
    
}