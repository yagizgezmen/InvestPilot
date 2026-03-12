"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                // Auto login after registration
                const signInRes = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (signInRes?.error) {
                    setError("Registration successful, but login failed. Please login manually.");
                } else {
                    router.push("/portfolio");
                    router.refresh();
                }
            } else {
                const errorText = await res.text();
                setError(errorText || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] animate-fade-in relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="glass-panel p-8 rounded-3xl w-full max-w-md relative z-10 border border-slate-700/50 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-purple-500/10 rounded-2xl ring-1 ring-purple-500/20">
                        <UserPlus className="h-8 w-8 text-purple-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center text-white mb-2">Create Account</h1>
                <p className="text-center text-slate-400 text-sm mb-8">Join InvestPilot to save your parameters and portfolio.</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center text-balance">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-300 ml-1 tracking-wide">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#0f172a]/80 border border-white/10 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-inner font-medium placeholder:text-slate-500 hover:bg-[#1e293b]"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-300 ml-1 tracking-wide">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0f172a]/80 border border-white/10 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-inner font-medium placeholder:text-slate-500 hover:bg-[#1e293b]"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-300 ml-1 tracking-wide">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#0f172a]/80 border border-white/10 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-inner font-medium placeholder:text-slate-500 hover:bg-[#1e293b]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 btn-premium"
                    >
                        {loading ? "Creating..." : (
                            <>Sign Up <ArrowRight className="h-4 w-4" /></>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
