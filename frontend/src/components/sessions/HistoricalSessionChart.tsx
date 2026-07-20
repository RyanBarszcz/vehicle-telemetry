"use client";

import {
    useEffect,
    useMemo,
    useState,
    type WheelEvent,
} from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Brush,
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
import {
    ChevronLeft,
    ChevronRight,
    GripVertical,
} from "lucide-react";

import type { LiveTelemetryPoint } from "@/types/telemetry";
import {
    telemetryMetrics,
    type TelemetryMetricKey,
} from "@/lib/telemetryMetrics";

type HistoricalSessionChartProps = {
    points: LiveTelemetryPoint[];
    trackedMetrics: TelemetryMetricKey[];
    onReorderMetrics: (
        metrics: TelemetryMetricKey[]
    ) => void;
};

type ChartDataPoint = {
    index: number;
    timestamp: string;
    elapsedSeconds: number;
    elapsedLabel: string;
    speed_mph: number;
    rpm: number;
    throttle_percent: number;
    coolant_temp_f: number;
    boost_psi: number | null;
};

type VisibleRange = {
    startIndex: number;
    endIndex: number;
};

const DEFAULT_WINDOW_SECONDS = 60;

export default function HistoricalSessionChart({
    points,
    trackedMetrics,
    onReorderMetrics,
}: HistoricalSessionChartProps) {
    const chartData = useMemo<ChartDataPoint[]>(() => {
        if (points.length === 0) {
            return [];
        }

        const firstTimestamp =
            new Date(points[0].timestamp).getTime();

        return points.map((point, index) => {
            const timestamp =
                new Date(point.timestamp).getTime();

            const elapsedSeconds = Math.max(
                0,
                (timestamp - firstTimestamp) / 1000
            );

            return {
                index,
                timestamp: point.timestamp,
                elapsedSeconds,
                elapsedLabel:
                    formatElapsedTime(elapsedSeconds),
                speed_mph: point.speed_mph,
                rpm: point.rpm,
                throttle_percent:
                    point.throttle_percent,
                coolant_temp_f:
                    point.coolant_temp_f,
                boost_psi: point.boost_psi ?? null,
            };
        });
    }, [points]);

    const estimatedPointsPerSecond =
        useMemo(() => {
            if (chartData.length < 2) {
                return 1;
            }

            const totalSeconds =
                chartData[
                    chartData.length - 1
                ].elapsedSeconds;

            if (totalSeconds <= 0) {
                return 1;
            }

            return Math.max(
                1,
                chartData.length / totalSeconds
            );
        }, [chartData]);

    const defaultWindowPointCount =
        useMemo(() => {
            return Math.max(
                2,
                Math.round(
                    estimatedPointsPerSecond *
                    DEFAULT_WINDOW_SECONDS
                )
            );
        }, [estimatedPointsPerSecond]);

    const [visibleRange, setVisibleRange] =
        useState<VisibleRange>({
            startIndex: 0,
            endIndex: 0,
        });

    useEffect(() => {
        if (chartData.length === 0) {
            setVisibleRange({
                startIndex: 0,
                endIndex: 0,
            });

            return;
        }

        setVisibleRange({
            startIndex: 0,
            endIndex: Math.min(
                chartData.length - 1,
                defaultWindowPointCount - 1
            ),
        });
    }, [
        chartData.length,
        defaultWindowPointCount,
    ]);

    const visibleData = useMemo(() => {
        if (chartData.length === 0) {
            return [];
        }

        return chartData.slice(
            visibleRange.startIndex,
            visibleRange.endIndex + 1
        );
    }, [chartData, visibleRange]);

    const visibleStartPoint =
        visibleData[0] ?? null;

    const visibleEndPoint =
        visibleData[
        visibleData.length - 1
        ] ?? null;

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

    function updateVisibleRange(
        startIndex: number,
        endIndex: number
    ) {
        if (chartData.length === 0) {
            return;
        }

        const safeStartIndex = Math.max(
            0,
            Math.min(
                startIndex,
                chartData.length - 1
            )
        );

        const safeEndIndex = Math.max(
            safeStartIndex,
            Math.min(
                endIndex,
                chartData.length - 1
            )
        );

        setVisibleRange({
            startIndex: safeStartIndex,
            endIndex: safeEndIndex,
        });
    }

    function moveVisibleRange(
        direction: -1 | 1
    ) {
        const windowSize =
            visibleRange.endIndex -
            visibleRange.startIndex +
            1;

        const movement = Math.max(
            1,
            Math.round(windowSize * 0.2)
        );

        const requestedStart =
            visibleRange.startIndex +
            direction * movement;

        const maximumStart = Math.max(
            0,
            chartData.length - windowSize
        );

        const nextStart = Math.max(
            0,
            Math.min(
                requestedStart,
                maximumStart
            )
        );

        updateVisibleRange(
            nextStart,
            nextStart + windowSize - 1
        );
    }

    function handleTimelineWheel(
        event: WheelEvent<HTMLDivElement>
    ) {
        const isHorizontalGesture =
            Math.abs(event.deltaX) >
            Math.abs(event.deltaY);

        const isShiftWheel =
            event.shiftKey &&
            Math.abs(event.deltaY) > 0;

        if (
            !isHorizontalGesture &&
            !isShiftWheel
        ) {
            return;
        }

        event.preventDefault();

        const delta = isHorizontalGesture
            ? event.deltaX
            : event.deltaY;

        moveVisibleRange(
            delta > 0 ? 1 : -1
        );
    }

    function setWindowSeconds(
        seconds: number | "full"
    ) {
        if (chartData.length === 0) {
            return;
        }

        if (seconds === "full") {
            updateVisibleRange(
                0,
                chartData.length - 1
            );

            return;
        }

        const requestedPointCount =
            Math.max(
                2,
                Math.round(
                    estimatedPointsPerSecond *
                    seconds
                )
            );

        const currentCenterIndex =
            Math.round(
                (
                    visibleRange.startIndex +
                    visibleRange.endIndex
                ) / 2
            );

        const halfWindow =
            Math.floor(
                requestedPointCount / 2
            );

        let nextStart =
            currentCenterIndex -
            halfWindow;

        let nextEnd =
            nextStart +
            requestedPointCount -
            1;

        if (nextStart < 0) {
            nextStart = 0;
            nextEnd = Math.min(
                chartData.length - 1,
                requestedPointCount - 1
            );
        }

        if (
            nextEnd >
            chartData.length - 1
        ) {
            nextEnd =
                chartData.length - 1;

            nextStart = Math.max(
                0,
                nextEnd -
                requestedPointCount +
                1
            );
        }

        updateVisibleRange(
            nextStart,
            nextEnd
        );
    }

    if (chartData.length === 0) {
        return (
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-zinc-400">
                    No historical telemetry points
                    were found.
                </p>
            </section>
        );
    }

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        Recorded Telemetry
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                        Drag the timeline or
                        horizontally scroll any graph.
                        All graphs stay synchronized.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <TimelineWindowButton
                        label="15 sec"
                        onClick={() =>
                            setWindowSeconds(15)
                        }
                    />

                    <TimelineWindowButton
                        label="30 sec"
                        onClick={() =>
                            setWindowSeconds(30)
                        }
                    />

                    <TimelineWindowButton
                        label="1 min"
                        onClick={() =>
                            setWindowSeconds(60)
                        }
                    />

                    <TimelineWindowButton
                        label="5 min"
                        onClick={() =>
                            setWindowSeconds(300)
                        }
                    />

                    <TimelineWindowButton
                        label="Full"
                        onClick={() =>
                            setWindowSeconds("full")
                        }
                    />
                </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <SummaryCard
                    label="Total points"
                    value={chartData.length.toLocaleString()}
                />

                <SummaryCard
                    label="Visible range"
                    value={
                        visibleStartPoint &&
                            visibleEndPoint
                            ? `${visibleStartPoint.elapsedLabel} – ${visibleEndPoint.elapsedLabel}`
                            : "—"
                    }
                />

                <SummaryCard
                    label="Visible points"
                    value={visibleData.length.toLocaleString()}
                />
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-zinc-900/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            moveVisibleRange(-1)
                        }
                        disabled={
                            visibleRange.startIndex === 0
                        }
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Move timeline backward"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="text-center">
                        <p className="text-xs text-zinc-500">
                            Session timeline
                        </p>

                        <p className="text-sm font-medium tabular-nums text-white">
                            {visibleStartPoint?.elapsedLabel ??
                                "0:00"}{" "}
                            –{" "}
                            {visibleEndPoint?.elapsedLabel ??
                                "0:00"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            moveVisibleRange(1)
                        }
                        disabled={
                            visibleRange.endIndex >=
                            chartData.length - 1
                        }
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Move timeline forward"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="h-[72px] min-w-0 w-full">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                    >
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 4,
                                right: 6,
                                bottom: 0,
                                left: 6,
                            }}
                        >
                            <XAxis
                                dataKey="elapsedSeconds"
                                type="number"
                                domain={[
                                    "dataMin",
                                    "dataMax",
                                ]}
                                hide
                            />

                            <Line
                                type="linear"
                                dataKey="speed_mph"
                                stroke="#3b82f6"
                                strokeWidth={1}
                                dot={false}
                                isAnimationActive={false}
                            />

                            <Brush
                                dataKey="elapsedLabel"
                                height={28}
                                travellerWidth={10}
                                startIndex={
                                    visibleRange.startIndex
                                }
                                endIndex={
                                    visibleRange.endIndex
                                }
                                onChange={(range) => {
                                    if (
                                        range.startIndex ===
                                        undefined ||
                                        range.endIndex ===
                                        undefined
                                    ) {
                                        return;
                                    }

                                    updateVisibleRange(
                                        range.startIndex,
                                        range.endIndex
                                    );
                                }}
                                stroke="#3b82f6"
                                fill="#18181b"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <DndContext
                collisionDetection={closestCenter}
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
                                <HistoricalChartCard
                                    key={metricKey}
                                    metricKey={metricKey}
                                    data={visibleData}
                                    onWheel={
                                        handleTimelineWheel
                                    }
                                />
                            )
                        )}
                    </div>
                </SortableContext>
            </DndContext>

            <p className="mt-4 text-xs text-zinc-500">
                The full recording contains{" "}
                {chartData.length.toLocaleString()}{" "}
                points. The graphs currently show{" "}
                {visibleData.length.toLocaleString()}{" "}
                points without discarding any CSV
                data.
            </p>
        </section>
    );
}

type HistoricalChartCardProps = {
    metricKey: TelemetryMetricKey;
    data: ChartDataPoint[];
    onWheel: (
        event: WheelEvent<HTMLDivElement>
    ) => void;
};

function HistoricalChartCard({
    metricKey,
    data,
    onWheel,
}: HistoricalChartCardProps) {
    const metric =
        telemetryMetrics[metricKey];

    const latestVisibleValue =
        data[data.length - 1]?.[metricKey];

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
            <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-white">
                        {metric.label}
                    </h3>

                    <p className="text-xs text-zinc-500">
                        {metric.unit}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-zinc-500">
                            End of range
                        </p>

                        <p className="text-lg font-semibold tabular-nums text-white">
                            {formatMetricValue(
                                typeof latestVisibleValue ===
                                    "number"
                                    ? latestVisibleValue
                                    : null,
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

            <div
                onWheel={onWheel}
                className="h-[140px] min-w-0 w-full sm:h-[150px] lg:h-[160px]"
            >
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                >
                    <LineChart
                        data={data}
                        syncId="historical-session-charts"
                        margin={{
                            top: 4,
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
                            dataKey="elapsedSeconds"
                            type="number"
                            domain={[
                                "dataMin",
                                "dataMax",
                            ]}
                            tickFormatter={
                                formatElapsedTime
                            }
                            tick={{
                                fill: "#71717a",
                                fontSize: 11,
                            }}
                            axisLine={{
                                stroke:
                                    "rgba(255,255,255,0.1)",
                            }}
                            tickLine={false}
                            minTickGap={40}
                        />

                        <YAxis
                            tick={{
                                fill: "#71717a",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={48}
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
                            labelFormatter={(
                                value
                            ) =>
                                formatElapsedTime(
                                    Number(value)
                                )
                            }
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
                            type="linear"
                            dataKey={metricKey}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                            activeDot={{
                                r: 4,
                            }}
                            name={metric.label}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </article>
    );
}

function TimelineWindowButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-full border border-white/10 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
        >
            {label}
        </button>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/70 p-3">
            <p className="text-xs text-zinc-500">
                {label}
            </p>

            <p className="mt-1 font-semibold tabular-nums text-white">
                {value}
            </p>
        </div>
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

function formatElapsedTime(
    secondsValue: number
) {
    const totalSeconds = Math.max(
        0,
        Math.round(secondsValue)
    );

    const hours = Math.floor(
        totalSeconds / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const seconds =
        totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
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