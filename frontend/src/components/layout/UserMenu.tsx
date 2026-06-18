import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";

const isLoggedIn = true;

export default function UserMenu() {
    if (!isLoggedIn) {
        return (
            <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200">
                Sign In
            </button>
        );
    }

    return (
        <div className="group relative">
            <button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-blue-600 text-sm font-bold text-white">
                RB
            </button>

            <div className="invisible absolute right-0 top-10 w-56 rounded-2xl border border-white/10 bg-zinc-950 p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <div className="border-b border-white/10 px-3 py-3">
                    <p className="text-sm font-semibold text-white">Ryan Barszcz</p>
                    <p className="mt-1 text-xs text-zinc-400">ryan@example.com</p>
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
                    <User className="h-4 w-4" />
                    My Garage
                </Link>

                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}