"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import {
    createTelemetryPoint,
    getSessionTelemetry,
    type TelemetryPoint,
} from "@/lib/api";

type SessionChartProps = {
    sessionId: string;
};

export default function SessionChart({ sessionId }: SessionChartProps) {
    const { getToken } = useAuth();

    const [points, setPoints] = useState<TelemetryPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    async function loadTelemetry() {
        try {
            setLoading(true);

            const token = await getToken();

            if (!token) {
                return;
            }

            const data = await getSessionTelemetry(token, sessionId);
            setPoints(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load telemetry");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddTestPoint() {
        try {
            setAdding(true);

            const token = await getToken();

            if (!token) {
                toast.error("Please sign in.");
                return;
            }

            await createTelemetryPoint(token, sessionId, {
                timestamp: new Date().toISOString(),
                rpm: Math.floor(1800 + Math.random() * 4500),
                speed_mph: Math.floor(20 + Math.random() * 80),
                throttle_percent: Math.floor(10 + Math.random() * 90),
                coolant_temp_f: Math.floor(180 + Math.random() * 30),
                intake_temp_f: Math.floor(70 + Math.random() * 40),
                boost_psi: Number((Math.random() * 20).toFixed(1)),
                fuel_level_percent: Math.floor(20 + Math.random() * 80),
                battery_voltage: Number((12 + Math.random() * 2).toFixed(1)),
            });

            toast.success("Test point added");
            await loadTelemetry();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add test point");
        } finally {
            setAdding(false);
        }
    }

    useEffect(() => {
        loadTelemetry();
    }, [sessionId]);

    const latest = points[points.length - 1];

    const chartData = points.map((point, index) => ({
        index: index + 1,
        rpm: point.rpm,
        speed: point.speed_mph,
        throttle: point.throttle_percent,
        coolant: point.coolant_temp_f,
    }));

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        Telemetry Data
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        RPM, speed, throttle, and temperature points for this session.
                    </p>
                </div>

                <button
                    onClick={handleAddTestPoint}
                    disabled={adding}
                    className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                    {adding ? "Adding..." : "Add Test Point"}
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-zinc-400">Loading telemetry...</p>
            ) : points.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center">
                    <p className="text-sm text-zinc-400">
                        No telemetry points yet. Add a test point to verify the pipeline.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl bg-zinc-900/70 p-4">
                            <p className="text-xs text-zinc-500">Points</p>
                            <p className="mt-1 text-xl font-semibold text-white">
                                {points.length}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-zinc-900/70 p-4">
                            <p className="text-xs text-zinc-500">Latest RPM</p>
                            <p className="mt-1 text-xl font-semibold text-white">
                                {latest?.rpm.toLocaleString()}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-zinc-900/70 p-4">
                            <p className="text-xs text-zinc-500">Latest Speed</p>
                            <p className="mt-1 text-xl font-semibold text-white">
                                {latest?.speed_mph} mph
                            </p>
                        </div>

                        <div className="rounded-2xl bg-zinc-900/70 p-4">
                            <p className="text-xs text-zinc-500">Coolant</p>
                            <p className="mt-1 text-xl font-semibold text-white">
                                {latest?.coolant_temp_f}°F
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="h-80 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                            <h3 className="mb-4 text-sm font-semibold text-white">
                                RPM
                            </h3>

                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="index" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#09090b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rpm"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="h-80 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                            <h3 className="mb-4 text-sm font-semibold text-white">
                                Speed
                            </h3>

                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="index" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#09090b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="speed"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="h-80 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                            <h3 className="mb-4 text-sm font-semibold text-white">
                                Throttle
                            </h3>

                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="index" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#09090b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="throttle"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="h-80 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                            <h3 className="mb-4 text-sm font-semibold text-white">
                                Coolant Temp
                            </h3>

                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="index" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#09090b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="coolant"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <p className="text-xs text-zinc-500">
                        Showing last {Math.min(points.length, 40)} telemetry points by RPM.
                    </p>
                </div>
            )}
        </section>
    );
}