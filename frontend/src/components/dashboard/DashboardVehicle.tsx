export default function DashboardVehicle({
    name,
    subtitle,
    status,
}: {
    name: string;
    subtitle: string;
    status: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
            </div>

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                {status}
            </span>
        </div>
    );
}