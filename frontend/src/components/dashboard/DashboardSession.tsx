export default function DashboardSession({
    title,
    vehicle,
    stats,
}: {
    title: string;
    vehicle: string;
    stats: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{vehicle}</p>
            <p className="mt-3 text-sm text-zinc-500">{stats}</p>
        </div>
    );
}