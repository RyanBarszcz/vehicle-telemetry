import { notFound } from "next/navigation";

import VehicleDetailHeader from "@/components/vehicles/VehicleDetailHeader";
import VehicleOverviewStats from "@/components/vehicles/VehicleOverviewStats";
import VehicleRecentSessions from "@/components/vehicles/VehicleRecentSessions";
import { mockVehicles } from "@/lib/mockVehicles";

type VehiclePageProps = {
    params: Promise<{
        vehicleId: string;
    }>;
};

export default async function VehiclePage({ params }: VehiclePageProps) {
    const { vehicleId } = await params;

    const vehicle = mockVehicles.find(
        (vehicle) => vehicle.id === vehicleId
    );

    if (!vehicle) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <VehicleDetailHeader vehicle={vehicle} />

                <VehicleOverviewStats />

                <VehicleRecentSessions vehicleId={vehicle.id} />
            </div>
        </main>
    );
}