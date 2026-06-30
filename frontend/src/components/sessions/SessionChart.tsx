"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import type { LiveTelemetryPoint } from "@/app/sessions/[sessionId]/page";

type SessionChartProps = {
    sessionId: string;
    points: LiveTelemetryPoint[];
    currentPoint: LiveTelemetryPoint | null;
};

export default function SessionChart({
    points,
    currentPoint,
}: SessionChartProps) {
    const latest = currentPoint ?? points[points.length - 1];

    const chartData = points.map((point, index) => ({
        index: index + 1,
        time: new Date(point.timestamp).toLocaleTimeString([], {
            minute: "2-digit",
            second: "2-digit",
        }),
        speed: point.speed_mph,
        rpm: point.rpm,
        throttle: point.throttle_percent,
        coolant: point.coolant_temp_f,
        boost: point.boost_psi ?? 0,
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
            </div>

            {points.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center">
                    <p className="text-sm text-zinc-400">
                        Waiting for live telemetry...
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
                        <ChartCard
                            title="RPM"
                            data={chartData}
                            dataKey="rpm"
                            stroke="#3b82f6"
                        />

                        <ChartCard
                            title="Speed"
                            data={chartData}
                            dataKey="speed"
                            stroke="#22c55e"
                        />

                        <ChartCard
                            title="Throttle"
                            data={chartData}
                            dataKey="throttle"
                            stroke="#f59e0b"
                        />

                        <ChartCard
                            title="Coolant Temp"
                            data={chartData}
                            dataKey="coolant"
                            stroke="#ef4444"
                        />
                    </div>

                    <p className="text-xs text-zinc-500">
                        Showing last {Math.min(points.length, 60)} telemetry points.
                    </p>
                </div>
            )}
        </section>
    );
}

type ChartDataPoint = {
    index: number;
    time: string;
    speed: number;
    rpm: number;
    throttle: number;
    coolant: number;
    boost: number;
};

type ChartCardProps = {
    title: string;
    data: ChartDataPoint[];
    dataKey: "rpm" | "speed" | "throttle" | "coolant";
    stroke: string;
};

function ChartCard({ title, data, dataKey, stroke }: ChartCardProps) {
    return (
        <div className="h-80 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>

            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
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
                        dataKey={dataKey}
                        stroke={stroke}
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}