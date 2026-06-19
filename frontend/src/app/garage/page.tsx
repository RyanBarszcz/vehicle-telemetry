import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import GarageHeader from "@/components/garage/GarageHeader";
import GarageStats from "@/components/garage/GarageStats";
import VehicleCard from "@/components/garage/VehicleCard";
import { mockVehicles } from "@/lib/mockVehicles";

export default async function GaragePage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <GarageHeader />

                <GarageStats />

                <section>
                    <div className="mb-5">
                        <h2 className="text-2xl font-semibold">
                            Connected Vehicles
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                            Select a vehicle to view sessions, telemetry, and analytics.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {mockVehicles.map((vehicle) => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}