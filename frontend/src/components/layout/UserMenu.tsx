"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, Settings, UserIcon } from "lucide-react";

export default function UserMenu() {
    const { signOut } = useClerk();
    const { isLoaded, isSignedIn, user } = useUser();

    async function handleSignOut() {
        await signOut();
        window.location.href = "/";
    }

    if (!isLoaded) {
        return null;
    }

    if (!isSignedIn || !user) {
        return (
            <Link
                href="/login"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
                Sign In
            </Link>
        );
    }

    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    const email = user.primaryEmailAddress?.emailAddress ?? "";

    const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

    const fullName = `${firstName} ${lastName}`.trim();

    return (
        <div className="group relative">
            <button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-blue-600 text-sm font-bold text-white">
                {initials || "U"}
            </button>

            <div className="invisible absolute right-0 top-10 w-56 rounded-2xl border border-white/10 bg-zinc-950 p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <div className="border-b border-white/10 px-3 py-3">
                    <p className="text-sm font-semibold text-white">
                        {fullName || "User"}
                    </p>
                    <p className="mt-1 truncate text-xs text-zinc-400">{email}</p>
                </div>

                <Link
                    href="/settings"
                    className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>

                <Link
                    href="/garage"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                    <UserIcon className="h-4 w-4" />
                    My Garage
                </Link>

                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}