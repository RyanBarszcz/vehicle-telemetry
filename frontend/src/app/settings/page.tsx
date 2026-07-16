"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsSection from "@/components/settings/SettingsSection";

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { openUserProfile } = useClerk();

    if (!isLoaded) {
        return (
            <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm text-zinc-400">
                        Loading settings...
                    </p>
                </div>
            </main>
        );
    }

    const name =
        user?.fullName ||
        user?.firstName ||
        "Not provided";

    const email =
        user?.primaryEmailAddress?.emailAddress ||
        "Not provided";

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-5xl space-y-8">
                <SettingsHeader />

                <SettingsSection
                    title="Profile"
                    description="View your account information and manage your Clerk profile."
                >
                    <SettingRow label="Name" value={name} />

                    <SettingRow label="Email" value={email} />

                    <button
                        type="button"
                        onClick={() => openUserProfile()}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-left transition hover:border-blue-500/30 hover:bg-white/[0.06]"
                    >
                        <div>
                            <p className="font-medium text-white">
                                Manage Account
                            </p>

                            <p className="mt-1 text-sm text-zinc-400">
                                Update your profile, email, password, and security settings.
                            </p>
                        </div>

                        <ArrowRight className="h-5 w-5 text-blue-400" />
                    </button>
                </SettingsSection>

                <SettingsSection
                    title="Telemetry"
                    description="Configure how telemetry data is displayed."
                >
                    <SettingRow
                        label="Speed Units"
                        value="MPH"
                    />

                    <SettingRow
                        label="Temperature Units"
                        value="Fahrenheit"
                    />

                    <SettingRow
                        label="Pressure Units"
                        value="PSI"
                    />
                </SettingsSection>

                <SettingsSection
                    title="About"
                    description="Application information."
                >
                    <SettingRow
                        label="Application"
                        value="DriveIQ"
                    />

                    <SettingRow
                        label="Version"
                        value="1.0.0"
                    />
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
        <div className="flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="font-medium text-white">
                {label}
            </p>

            <p className="truncate text-sm text-zinc-400">
                {value}
            </p>
        </div>
    );
}