export default function SessionChart() {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                    Session Telemetry
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                    RPM and speed throughout the session.
                </p>
            </div>

            <div className="flex h-72 items-end gap-2">
                {[
                    35, 42, 56, 64, 72,
                    85, 91, 75, 68, 82,
                    95, 76, 71, 89, 93,
                    77, 61, 70,
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