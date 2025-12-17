"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("password", {
        flow: "signIn",
        email: email.trim().toLowerCase(),
        password,
      });
      
      // Wait a moment for auth state to update, then redirect
      if (result.signingIn) {
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 500);
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to sign in.";
      if (message.toLowerCase().includes("invalidaccountid")) {
        setError("Account not found. Please sign up first.");
      } else if (message.toLowerCase().includes("invalid credentials") || message.toLowerCase().includes("invalidsecret")) {
        setError("Invalid email or password.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your Mediumish account
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-slate-900 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

