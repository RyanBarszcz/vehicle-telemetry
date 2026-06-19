/* eslint-disable @next/next/no-img-element */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, setActive, isLoaded } = useSignIn();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
    const [secondFactorCode, setSecondFactorCode] = useState("");

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData((current) => ({
            ...current,
            [e.target.name]: e.target.value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isLoaded) return;

        const toastId = toast.loading("Signing in...");

        try {
            setLoading(true);
            setError("");

            const result = await signIn.create({
                identifier: formData.email,
                password: formData.password,
            });

            if (result.status === "complete" && result.createdSessionId) {
                await setActive({
                    session: result.createdSessionId,
                });

                toast.success("Signed in successfully", { id: toastId });

                router.push("/garage");
                router.refresh();
                return;
            }

            if (result.status === "needs_second_factor") {
                toast.dismiss(toastId);
                setNeedsSecondFactor(true);
                return;
            }

            toast.error("Sign in incomplete", { id: toastId });
            setError(`Sign in incomplete: ${result.status}`);
        } catch (err) {
            console.error(err);
            toast.error("Invalid email or password", { id: toastId });
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSecondFactor(e: React.FormEvent) {
        e.preventDefault();
        if (!isLoaded) return;

        const toastId = toast.loading("Verifying code...");

        try {
            setLoading(true);
            setError("");

            const result = await signIn.attemptSecondFactor({
                strategy: "totp",
                code: secondFactorCode,
            });

            if (result.status === "complete" && result.createdSessionId) {
                await setActive({
                    session: result.createdSessionId,
                });

                toast.success("Signed in successfully", { id: toastId });

                router.push("/garage");
                router.refresh();
                return;
            }

            toast.error("Second factor incomplete", { id: toastId });
            setError(`Second factor incomplete: ${result.status}`);
        } catch (err) {
            console.error(err);
            toast.error("Invalid verification code", { id: toastId });
            setError("Invalid verification code.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
            <div className="flex h-[90vh] w-[95vw] max-w-[1800px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
                <div className="relative hidden w-1/2 md:block">
                    <img
                        src="/backgrounds/login.jpg"
                        alt="Vehicle telemetry dashboard"
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="relative z-10 flex h-full flex-col justify-end p-10">
                        <h1 className="text-5xl font-bold leading-tight">
                            Welcome back.
                        </h1>

                        <p className="mt-4 max-w-md text-lg text-zinc-300">
                            Access your garage, previous sessions, and saved vehicle data.
                        </p>

                        <p className="mt-8 text-sm text-zinc-500">
                            © 2026 Car Data Logger
                        </p>
                    </div>
                </div>

                <div className="flex w-full items-center bg-zinc-950 md:w-1/2">
                    <div className="mx-auto w-full max-w-md px-8 md:px-10">
                        <div>
                            <h2 className="text-3xl font-bold">
                                {needsSecondFactor ? "Verify login" : "Sign in"}
                            </h2>

                            <p className="mt-2 text-zinc-400">
                                {needsSecondFactor
                                    ? "Enter your verification code."
                                    : "Continue to your garage."}
                            </p>
                        </div>

                        {error && (
                            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </p>
                        )}

                        {!needsSecondFactor ? (
                            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                <div>
                                    <label className="text-sm text-zinc-400">Email</label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-400">Password</label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                                >
                                    {loading ? "Signing in..." : "Sign in"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSecondFactor} className="mt-8 space-y-5">
                                <div>
                                    <label className="text-sm text-zinc-400">
                                        Verification code
                                    </label>

                                    <input
                                        type="text"
                                        value={secondFactorCode}
                                        onChange={(e) => setSecondFactorCode(e.target.value)}
                                        placeholder="123456"
                                        required
                                        className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                                >
                                    {loading ? "Verifying..." : "Verify code"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setNeedsSecondFactor(false);
                                        setSecondFactorCode("");
                                        setError("");
                                    }}
                                    className="w-full text-sm text-zinc-400 hover:text-white"
                                >
                                    Back to login
                                </button>
                            </form>
                        )}

                        <div className="mt-6 flex justify-center">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-zinc-400 transition hover:text-blue-400"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <p className="text-sm text-zinc-400">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/sign-up"
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}