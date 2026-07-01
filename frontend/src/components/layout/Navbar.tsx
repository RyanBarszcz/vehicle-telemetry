import Link from "next/link";
import { Gauge } from "lucide-react";
import UserMenu from "./UserMenu";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                        <Gauge className="h-5 w-5 text-white" />
                    </div>

                    <span className="text-lg font-bold text-white">
                        Telemetry
                    </span>
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    <Link href="/garage" className="text-sm font-medium text-zinc-300 hover:text-white">
                        Garage
                    </Link>

                    <Link href="/sessions" className="text-sm font-medium text-zinc-300 hover:text-white">
                        Sessions
                    </Link>

                    <Link href="/alerts" className="text-sm font-medium text-zinc-300 hover:text-white">
                        Alerts
                    </Link>
                </div>

                <UserMenu />
            </div>
        </nav>
    );
}