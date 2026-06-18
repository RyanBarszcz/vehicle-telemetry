import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsSection from "@/components/settings/SettingsSection";

export default function SettingsPage() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-5xl space-y-8">
                <SettingsHeader />

                <SettingsSection
                    title="Profile"
                    description="Basic account information for your telemetry account."
                >
                    <SettingRow label="Username" value="Ryan" />
                    <SettingRow label="Email" value="ryan@example.com" />
                </SettingsSection>

                <SettingsSection
                    title="Notifications"
                    description="Choose how vehicle alerts should reach you."
                >
                    <SettingRow label="Push Alerts" value="Enabled" />
                    <SettingRow label="Email Alerts" value="Disabled" />
                    <SettingRow label="Critical Vehicle Alerts" value="Enabled" />
                </SettingsSection>

                <SettingsSection
                    title="Connected Devices"
                    description="Manage OBD-II/CAN loggers connected to your vehicles."
                >
                    <SettingRow label="ESP32 Logger" value="Connected" />
                    <SettingRow label="Raspberry Pi Logger" value="Not connected" />
                </SettingsSection>

                <SettingsSection
                    title="Preferences"
                    description="Customize how telemetry data is displayed."
                >
                    <SettingRow label="Units" value="MPH / Fahrenheit" />
                    <SettingRow label="Theme" value="Dark" />
                </SettingsSection>
            </div>
        </main>
    );
}

function SettingRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="font-medium text-white">{label}</p>
            <p className="text-sm text-zinc-400">{value}</p>
        </div>
    );
}