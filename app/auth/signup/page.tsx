"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
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
        flow: "signUp",
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
        err instanceof Error ? err.message : "Failed to sign up.";
      if (message.toLowerCase().includes("already exists")) {
        setError("Account already exists. Please log in instead.");
      } else if (message.toLowerCase().includes("invalid password") || (message.length < 8)) {
        setError("Password must be at least 8 characters long.");
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
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Welcome! Please fill in the details to get started.
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
              placeholder="Enter your password (min 8 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters long
            </p>
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || password.length < 8}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Continue"}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}




