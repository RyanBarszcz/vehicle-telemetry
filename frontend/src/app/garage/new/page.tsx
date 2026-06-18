import AddVehicleForm from "@/components/garage/new/AddVehicleForm";
import AddVehicleHeader from "@/components/garage/new/AddVehicleHeader";

export default function AddVehiclePage() {
    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-5xl space-y-8">
                <AddVehicleHeader />

                <AddVehicleForm />
            </div>
        </main>
    );
}