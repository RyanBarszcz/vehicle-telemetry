/* eslint-disable @next/next/no-img-element */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useSignUp } from "@clerk/nextjs/legacy";
import { toast } from "sonner";
// TODO: syncAccount from setupsRus
// import { syncAccount } from "@/lib/api";

export default function SignUpPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { signUp, setActive, isLoaded } = useSignUp();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const [verificationCode, setVerificationCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData((current) => ({
            ...current,
            [e.target.name]: e.target.value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isLoaded) return;

        const toastId = toast.loading("Creating account...");

        try {
            setLoading(true);
            setError("");

            await signUp.create({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                emailAddress: formData.email,
                password: formData.password,
            });

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            toast.success("Verification code sent to your email", {
                id: toastId,
            });

            setPendingVerification(true);
        } catch (err) {
            console.error(err);
            toast.error("Could not create account", { id: toastId });
            setError("Could not create account.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        if (!isLoaded) return;

        const toastId = toast.loading("Verifying account...");

        try {
            setLoading(true);
            setError("");

            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });

            if (result.status === "complete" && result.createdSessionId) {
                await setActive({
                    session: result.createdSessionId,
                });

                const token = await getToken();

                if (token) {
                    // await syncAccount(token);
                }

                toast.success("Account created successfully!", {
                    id: toastId,
                });

                router.push("/garage");
                router.refresh();
                return;
            }

            toast.error(`Verification failed: ${result.status}`, {
                id: toastId,
            });

            setError(`Sign up incomplete: ${result.status}`);
        } catch (err) {
            console.error(err);
            toast.error("Invalid verification code", { id: toastId });
            setError("Invalid verification code.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="w-[95vw] max-w-[1800px] h-[90vh] rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl flex">
                <div className="relative hidden w-1/2 md:block">
                    <img
                        src="/backgrounds/sign-up.jpg"
                        alt="Car data logger"
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="relative z-10 flex h-full flex-col justify-end p-10">
                        <h1 className="text-5xl font-bold leading-tight">
                            Log every drive.
                        </h1>

                        <p className="mt-4 max-w-md text-lg text-zinc-300">
                            Save vehicles, track sessions, and turn your car data into useful
                            insights.
                        </p>

                        <p className="mt-8 text-sm text-zinc-500">
                            © 2026 Car Data Logger
                        </p>
                    </div>
                </div>

                <div className="flex w-full items-center bg-zinc-950 md:w-1/2">
                    <div className="mx-auto w-full max-w-md px-8 md:px-10">
                        <h2 className="text-3xl font-bold">
                            {pendingVerification ? "Verify email" : "Create account"}
                        </h2>

                        <p className="mt-2 text-zinc-400">
                            {pendingVerification
                                ? "Enter the code sent to your email."
                                : "Create your garage and start logging sessions."}
                        </p>

                        {error && (
                            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </p>
                        )}

                        {!pendingVerification ? (
                            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-sm text-zinc-400">First name</label>
                                        <input
                                            name="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="John"
                                            required
                                            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Last name</label>
                                        <input
                                            name="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Doe"
                                            required
                                            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-400">Email</label>
                                    <input
                                        name="email"
                                        type="email"
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
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div id="clerk-captcha" className="mt-2" />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                                >
                                    {loading ? "Creating account..." : "Create account"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerify} className="mt-8 space-y-5">
                                <div>
                                    <label className="text-sm text-zinc-400">
                                        Verification code
                                    </label>

                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
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
                                    {loading ? "Verifying..." : "Verify email"}
                                </button>
                            </form>
                        )}

                        <div className="mt-6 flex justify-center">
                            <p className="text-sm text-zinc-400">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}