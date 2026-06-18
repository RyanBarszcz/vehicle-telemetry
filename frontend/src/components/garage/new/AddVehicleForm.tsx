export default function AddVehicleForm() {
    return (
        <form className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Nickname
                    </label>

                    <input
                        placeholder="Stage 1 GTI"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Year
                    </label>

                    <input
                        placeholder="2017"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Make
                    </label>

                    <input
                        placeholder="Volkswagen"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Model
                    </label>

                    <input
                        placeholder="GTI"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Trim
                    </label>

                    <input
                        placeholder="SE DSG"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                        VIN (Optional)
                    </label>

                    <input
                        placeholder="Vehicle Identification Number"
                        className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    type="button"
                    className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    Add Vehicle
                </button>
            </div>
        </form>
    );
}