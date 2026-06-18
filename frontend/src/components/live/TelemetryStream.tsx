export default function TelemetryStream() {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">
                    Live Telemetry
                </h2>

                <span className="text-sm text-zinc-500">
                    Last 30 Seconds
                </span>
            </div>

            <div className="flex h-72 items-end gap-2">
                {[
                    35, 55, 42, 70, 62,
                    85, 76, 95, 68, 80,
                    72, 90, 65, 82, 74,
                    88, 77, 92,
                ].map((height, index) => (
                    <div
                        key={index}
                        className="flex-1 rounded-t bg-blue-500/80"
                        style={{
                            height: `${height}%`,
                        }}
                    />
                ))}
            </div>
        </section>
    );
}