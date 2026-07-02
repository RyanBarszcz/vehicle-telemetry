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
import {
    DndContext,
    closestCenter,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type { LiveTelemetryPoint } from "@/types/telemetry";
import {
    telemetryMetrics,
    type TelemetryMetricKey,
} from "@/lib/telemetryMetrics";

type SessionChartProps = {
    sessionId: string;
    points: LiveTelemetryPoint[];
    currentPoint: LiveTelemetryPoint | null;
    trackedMetrics: TelemetryMetricKey[];
    onReorderMetrics: (metrics: TelemetryMetricKey[]) => void;
};

type ChartDataPoint = {
    index: number;
    time: string;
    speed_mph: number;
    rpm: number;
    throttle_percent: number;
    coolant_temp_f: number;
    boost_psi: number;
};

// TODO: Graphs look weird when the keep growing.
//       - Work on x-axis and how graphs look


export default function SessionChart({
    points,
    currentPoint,
    trackedMetrics,
    onReorderMetrics,
}: SessionChartProps) {
    const latest = currentPoint ?? points[points.length - 1];

    const visiblePoints = points.slice(-20);

    const chartData: ChartDataPoint[] = visiblePoints.map((point, index) => ({
        index: points.length - visiblePoints.length + index + 1,
        time: new Date(point.timestamp).toLocaleTimeString([], {
            minute: "2-digit",
            second: "2-digit",
        }),
        speed_mph: point.speed_mph,
        rpm: point.rpm,
        throttle_percent: point.throttle_percent,
        coolant_temp_f: point.coolant_temp_f,
        boost_psi: point.boost_psi ?? 0,
    }));

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = trackedMetrics.indexOf(active.id as TelemetryMetricKey);
        const newIndex = trackedMetrics.indexOf(over.id as TelemetryMetricKey);

        onReorderMetrics(arrayMove(trackedMetrics, oldIndex, newIndex));
    }

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        Telemetry Data
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        Showing only the metrics selected for this session. Drag charts to
                        organize your dashboard.
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

                        {trackedMetrics.slice(0, 3).map((metricKey) => {
                            const metric = telemetryMetrics[metricKey];
                            const value = latest?.[metricKey];

                            return (
                                <div
                                    key={metricKey}
                                    className="rounded-2xl bg-zinc-900/70 p-4"
                                >
                                    <p className="text-xs text-zinc-500">
                                        Latest {metric.label}
                                    </p>
                                    <p className="mt-1 text-xl font-semibold text-white">
                                        {formatMetricValue(value, metric.unit)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={trackedMetrics}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid gap-6 xl:grid-cols-2">
                                {trackedMetrics.map((metricKey) => (
                                    <SortableChartCard
                                        key={metricKey}
                                        metricKey={metricKey}
                                        data={chartData}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <p className="text-xs text-zinc-500">
                        Showing last {Math.min(points.length, 60)} telemetry points.
                    </p>
                </div>
            )}
        </section>
    );
}

type SortableChartCardProps = {
    metricKey: TelemetryMetricKey;
    data: ChartDataPoint[];
};

function SortableChartCard({ metricKey, data }: SortableChartCardProps) {
    const metric = telemetryMetrics[metricKey];

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: metricKey });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`h-80 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition ${isDragging ? "scale-[1.02] border-blue-500/50 opacity-80" : ""
                }`}
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-white">
                        {metric.label}
                    </h3>
                    <p className="text-xs text-zinc-500">{metric.unit}</p>
                </div>

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab rounded-lg p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white active:cursor-grabbing"
                >
                    <GripVertical className="h-4 w-4" />
                </button>
            </div>

            <ResponsiveContainer width="100%" height="82%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                        dataKey="time"
                        tick={{ fill: "#71717a", fontSize: 12 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickLine={false}
                        tickCount={6}
                    />
                    <YAxis
                        tick={{ fill: "#71717a", fontSize: 12 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#09090b",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "#fff",
                        }}
                        labelStyle={{ color: "#a1a1aa" }}
                    />
                    <Line
                        type="monotone"
                        dataKey={metricKey}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        name={metric.label}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function formatMetricValue(value: number | null | undefined, unit: string) {
    if (value === null || value === undefined) return "—";

    if (unit === "rpm") {
        return `${Math.round(value).toLocaleString()} rpm`;
    }

    if (unit === "%") {
        return `${Math.round(value)}%`;
    }

    if (unit === "°F") {
        return `${Math.round(value)}°F`;
    }

    if (unit === "mph") {
        return `${Math.round(value)} mph`;
    }

    if (unit === "psi") {
        return `${Number(value).toFixed(1)} psi`;
    }

    return `${value} ${unit}`;
}