type SettingsSectionProps = {
    title: string;
    description: string;
    children: React.ReactNode;
};

export default function SettingsSection({
    title,
    description,
    children,
}: SettingsSectionProps) {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm text-zinc-400">{description}</p>
            </div>

            <div className="space-y-4">{children}</div>
        </section>
    );
}