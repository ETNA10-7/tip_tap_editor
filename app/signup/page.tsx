"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      console.info("[signup] attempting signUp", { email });
      await signIn("password", {
        flow: "signUp",
        email,
        password,
      });
      router.push("/");
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to sign up.";
      if (message.toLowerCase().includes("already exists")) {
        setError("Account exists. Please log in instead.");
      } else if (message.toLowerCase().includes("invalidaccountid")) {
        setError("Sign up failed. Please retry.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Start writing with Mediumish.
        </p>
      </div>

      <div className="space-y-3">
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {error?.includes("log in") ? (
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="underline"
            >
              Go to login
            </button>
          </p>
        ) : null}
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </div>
    </div>
  );
}

