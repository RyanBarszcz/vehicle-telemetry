"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import { uploadSessionCsv } from "@/lib/api";

export default function UploadSessionPage() {
    const { getToken } = useAuth();

    const [sessionId, setSessionId] = useState("");
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [manifestFile, setManifestFile] = useState<File | null>(null);

    async function handleUpload() {
        if (!sessionId || !csvFile || !manifestFile) {
            toast.error("Session ID, CSV file, and manifest file are required.");
            return;
        }

        const token = await getToken();

        if (!token) {
            toast.error("Please sign in.");
            return;
        }

        const toastId = toast.loading("Uploading session CSV...");

        try {
            await uploadSessionCsv(token, sessionId, csvFile, manifestFile);
            toast.success("Session uploaded to S3", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload session", { id: toastId });
        }
    }

    return (
        <main className="mx-auto max-w-2xl px-6 py-10">
            <h1 className="text-2xl font-semibold text-white">Upload Session CSV</h1>

            <div className="mt-6 space-y-4">
                <input
                    value={sessionId}
                    onChange={(event) => setSessionId(event.target.value)}
                    placeholder="Session ID"
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
                />

                <input
                    type="file"
                    accept=".csv"
                    onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white"
                />

                <input
                    type="file"
                    accept=".json"
                    onChange={(event) => setManifestFile(event.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white"
                />

                <button
                    onClick={handleUpload}
                    className="rounded-xl bg-white px-5 py-3 font-medium text-zinc-950"
                >
                    Upload
                </button>
            </div>
        </main>
    );
}