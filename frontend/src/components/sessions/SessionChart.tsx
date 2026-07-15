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
    verticalListSortingStrategy,
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
    onReorderMetrics: (
        metrics: TelemetryMetricKey[]
    ) => void;
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

export default function SessionChart({
    points,
    currentPoint,
    trackedMetrics,
    onReorderMetrics,
}: SessionChartProps) {
    const latest =
        currentPoint ??
        points[points.length - 1] ??
        null;

    const visiblePoints = points.slice(-720);

    const chartData: ChartDataPoint[] =
        visiblePoints.map((point, index) => ({
            index:
                points.length -
                visiblePoints.length +
                index +
                1,
            time: new Date(
                point.timestamp
            ).toLocaleTimeString([], {
                minute: "2-digit",
                second: "2-digit",
            }),
            speed_mph: point.speed_mph,
            rpm: point.rpm,
            throttle_percent:
                point.throttle_percent,
            coolant_temp_f:
                point.coolant_temp_f,
            boost_psi: point.boost_psi ?? 0,
        }));

    function handleDragEnd(
        event: DragEndEvent
    ) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex =
            trackedMetrics.indexOf(
                active.id as TelemetryMetricKey
            );

        const newIndex =
            trackedMetrics.indexOf(
                over.id as TelemetryMetricKey
            );

        if (
            oldIndex === -1 ||
            newIndex === -1
        ) {
            return;
        }

        onReorderMetrics(
            arrayMove(
                trackedMetrics,
                oldIndex,
                newIndex
            )
        );
    }

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white">
                    Live Telemetry
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                    Drag the handle on any graph to
                    change its position.
                </p>
            </div>

            {points.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-10 text-center">
                    <p className="text-sm text-zinc-400">
                        Waiting for live telemetry...
                    </p>
                </div>
            ) : (
                <div className="space-y-6">

                    <DndContext
                        collisionDetection={
                            closestCenter
                        }
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={trackedMetrics}
                            strategy={
                                verticalListSortingStrategy
                            }
                        >
                            <div className="flex w-full flex-col gap-3">
                                {trackedMetrics.map(
                                    (metricKey) => (
                                        <SortableChartCard
                                            key={
                                                metricKey
                                            }
                                            metricKey={
                                                metricKey
                                            }
                                            data={
                                                chartData
                                            }
                                            latestValue={
                                                latest?.[
                                                metricKey
                                                ]
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <p className="text-xs text-zinc-500">
                        Showing the most recent{" "}
                        {visiblePoints.length.toLocaleString()}{" "}
                        telemetry points.
                    </p>
                </div>
            )}
        </section>
    );
}

type SortableChartCardProps = {
    metricKey: TelemetryMetricKey;
    data: ChartDataPoint[];
    latestValue:
    | number
    | null
    | undefined;
};

function SortableChartCard({
    metricKey,
    data,
    latestValue,
}: SortableChartCardProps) {
    const metric =
        telemetryMetrics[metricKey];

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: metricKey,
    });

    const style = {
        transform:
            CSS.Transform.toString(
                transform
            ),
        transition,
        zIndex: isDragging ? 20 : "auto",
    };

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={`min-w-0 w-full rounded-2xl border bg-zinc-900/70 p-3 ${isDragging
                ? "scale-[1.01] border-blue-500/50 opacity-90 shadow-2xl shadow-black/40"
                : "border-white/10"
                }`}
        >
            <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-white">
                        {metric.label}
                    </h3>

                    <p className="mt-0.5 text-xs text-zinc-500">
                        {metric.unit}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-zinc-500">
                            Current
                        </p>

                        <p className="text-xl font-semibold tabular-nums text-white">
                            {formatMetricValue(
                                latestValue,
                                metric.unit
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        aria-label={`Reorder ${metric.label} chart`}
                        {...attributes}
                        {...listeners}
                        className="touch-none cursor-grab rounded-lg p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white active:cursor-grabbing"
                    >
                        <GripVertical className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="h-[140px] w-full sm:h-[150px] lg:h-[160px]">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                >
                    <LineChart
                        data={data}
                        margin={{
                            top: 8,
                            right: 12,
                            bottom: 0,
                            left: 0,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.08)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="time"
                            tick={{
                                fill: "#71717a",
                                fontSize: 12,
                            }}
                            axisLine={{
                                stroke: "rgba(255,255,255,0.1)",
                            }}
                            tickLine={false}
                            minTickGap={32}
                        />

                        <YAxis
                            tick={{
                                fill: "#71717a",
                                fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={50}
                            domain={getMetricDomain(
                                metricKey
                            )}
                        />

                        <Tooltip
                            formatter={(value) => [
                                formatMetricValue(
                                    Number(value),
                                    metric.unit
                                ),
                                metric.label,
                            ]}
                            contentStyle={{
                                backgroundColor:
                                    "#09090b",
                                border:
                                    "1px solid rgba(255,255,255,0.1)",
                                borderRadius:
                                    "12px",
                                color: "#fff",
                            }}
                            labelStyle={{
                                color: "#a1a1aa",
                                marginBottom:
                                    "4px",
                            }}
                        />

                        <Line
                            type="monotone"
                            dataKey={metricKey}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 4,
                            }}
                            name={metric.label}
                            isAnimationActive={
                                false
                            }
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </article>
    );
}

function getMetricDomain(
    metricKey: TelemetryMetricKey
): [number | "auto", number | "auto"] {
    switch (metricKey) {
        case "speed_mph":
        case "rpm":
            return [0, "auto"];

        case "throttle_percent":
            return [0, 100];

        case "coolant_temp_f":
        case "boost_psi":
        default:
            return ["auto", "auto"];
    }
}

function formatMetricValue(
    value: number | null | undefined,
    unit: string
) {
    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
    ) {
        return "—";
    }

    const numericValue = Number(value);

    if (unit === "rpm") {
        return `${Math.round(
            numericValue
        ).toLocaleString()} rpm`;
    }

    if (unit === "%") {
        return `${Math.round(
            numericValue
        )}%`;
    }

    if (unit === "°F") {
        return `${Math.round(
            numericValue
        )}°F`;
    }

    if (unit === "mph") {
        return `${Math.round(
            numericValue
        )} mph`;
    }

    if (unit === "psi") {
        return `${numericValue.toFixed(
            1
        )} psi`;
    }

    return `${numericValue} ${unit}`;
}