export default function LiveHeader() {
    return (
        <section className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">
                        Stage 1 GTI
                    </h1>

                    <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                        Connected
                    </div>
                </div>

                <p className="mt-1 text-sm text-zinc-400">
                    2017 Volkswagen GTI SE DSG • OBD-II Logger Connected
                </p>
            </div>
        </section>
    );
}