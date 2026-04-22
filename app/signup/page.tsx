"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    // Auto sign-in after signup
    await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-green-200">Start your garden</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-green-500 mb-1">Username</label>
            <input
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_-]+"
              autoComplete="username"
              className="w-full rounded-xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-100 placeholder-green-700 focus:border-green-600 focus:outline-none"
              placeholder="your-garden-name"
            />
            <p className="mt-1 text-xs text-green-700">
              Your garden will be at /garden/username
            </p>
          </div>
          <div>
            <label className="block text-xs text-green-500 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-100 placeholder-green-700 focus:border-green-600 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-green-500 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-100 placeholder-green-700 focus:border-green-600 focus:outline-none"
              placeholder="min. 8 characters"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating garden…" : "Plant my first seed"}
          </button>
        </form>

        <p className="text-center text-xs text-green-600">
          Already have a garden?{" "}
          <Link href="/login" className="text-green-400 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
