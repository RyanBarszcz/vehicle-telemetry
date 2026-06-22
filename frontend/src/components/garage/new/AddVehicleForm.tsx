"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createVehicle } from "@/lib/api";
import { toast } from "sonner";

export default function AddVehicleForm() {
    const router = useRouter();
    const { getToken } = useAuth();

    const [nickname, setNickname] = useState("");
    const [year, setYear] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [trim, setTrim] = useState("");
    const [vin, setVin] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            const token = await getToken();

            if (!token) {
                toast.error("Please sign in.");
                return;
            }

            await createVehicle(token, {
                nickname: nickname || undefined,
                year: Number(year),
                make,
                model,
                trim: trim || undefined,
                vin: vin || undefined,
            });

            toast.success("Vehicle added");

            router.push("/garage");
            router.refresh();
        } catch (error) {
            console.error(error);

            toast.error("Failed to add vehicle");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
        >
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Nickname
                    </label>

                    <input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Stage 1 GTI"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Year
                    </label>

                    <input
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="2017"
                        type="number"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Make
                    </label>

                    <input
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        placeholder="Volkswagen"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Model
                    </label>

                    <input
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="GTI"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Trim
                    </label>

                    <input
                        value={trim}
                        onChange={(e) => setTrim(e.target.value)}
                        placeholder="SE DSG"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        VIN (Optional)
                    </label>

                    <input
                        value={vin}
                        onChange={(e) => setVin(e.target.value)}
                        placeholder="Vehicle Identification Number"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting
                        ? "Adding..."
                        : "Add Vehicle"}
                </button>
            </div>
        </form>
    );
}