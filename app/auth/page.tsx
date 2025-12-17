"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get redirect destination from URL params or default to home page
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const redirectTo = searchParams?.get("redirect") || "/";

  // Route when user is already authenticated (e.g., visiting /auth while logged in)
  // CRITICAL: Wait for isLoading to be false AND user to exist
  useEffect(() => {
    if (!isLoading && user) {
      // User exists in database - route to destination
      console.log("[AuthPage] ✅ User already authenticated and exists in database:");
      console.log("[AuthPage] User info:", {
        email: user.email,
        name: user.name,
        _id: user._id,
      });
      console.log("[AuthPage] Routing to:", redirectTo);
      router.push(redirectTo);
    } else if (!isLoading && !user) {
      // User is null - not authenticated
      console.log("[AuthPage] ❌ User is null - not authenticated");
    }
  }, [isLoading, user, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await signIn("password", {
        flow: mode === "login" ? "signIn" : "signUp",
        email: email.trim().toLowerCase(),
        password,
        ...(mode === "signup" && username.trim() ? { username: username.trim() } : {}),
      });

      if (result.signingIn) {
        // Success! The session token is stored in localStorage
        console.log("[AuthPage] ✅ Sign-in successful, session stored");
        
        // Check if session is stored (for debugging)
        if (typeof window !== "undefined") {
          const allKeys = Object.keys(localStorage);
          const sessionKeys = allKeys.filter(key => 
            key.toLowerCase().includes("convex") || 
            key.toLowerCase().includes("auth") || 
            key.toLowerCase().includes("session") || 
            key.toLowerCase().includes("token")
          );
          console.log("[AuthPage] Session keys in localStorage:", sessionKeys);
          
          if (sessionKeys.length > 0) {
            console.log("[AuthPage] ✅ Session tokens found, reloading page to establish session...");
          }
        }
        
        // CRITICAL: Force a full page reload to ensure ConvexAuthProvider picks up the session token
        // The Convex client needs to read the session token from localStorage on initialization
        // This ensures the session token is sent with all subsequent queries
        // Without this reload, queries continue to run without the session token
        setSuccess(true);
        setLoading(false);
        
        // CRITICAL: Reload page immediately to ensure ConvexAuthProvider reads tokens from localStorage
        // ConvexAuthProvider reads tokens on initialization, so we need a fresh page load
        // The delay ensures localStorage write is complete
        setTimeout(() => {
          console.log("[AuthPage] Reloading page to establish session and route to:", redirectTo);
          // Force full page reload - this ensures ConvexAuthProvider initializes with tokens
          window.location.href = redirectTo;
        }, 200);
        
        return;
      }
    } catch (err) {
      console.error("Auth error:", err);
      let message = err instanceof Error ? err.message : `Failed to ${mode === "login" ? "sign in" : "sign up"}.`;
      
      // Provide user-friendly error messages
      if (message.includes("InvalidSecret")) {
        message = "Invalid email or password. Please check your credentials and try again.";
      } else if (message.includes("InvalidAccountId")) {
        message = "Account not found. Please sign up first.";
      } else if (message.includes("already exists")) {
        message = "Account already exists. Please sign in instead.";
      } else if (message.includes("invalid password") || message.includes("password")) {
        message = "Password must be at least 8 characters long.";
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking if user is already authenticated
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  // If user is authenticated and validated, show redirecting message
  // (The useEffect will handle the redirect)
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Authentication successful!</p>
          <p className="text-sm text-muted-foreground">Validating session and redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to your Mediumish account"
              : "Sign up to start writing"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  mode === "login"
                    ? "Enter your password"
                    : "Enter password (min 8 characters)"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 8 : undefined}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {mode === "signup" && (
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            )}
          </div>

          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
              <p className="font-medium">Success!</p>
              <p>Redirecting you to write a post...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <p className="font-medium">Error</p>
              <p>{error}</p>
              {mode === "login" && error.includes("Invalid email or password") && (
                <p className="mt-2 text-xs">
                  Don't remember your password? Try signing up with a new account or use the email you signed up with.
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || (mode === "signup" && password.length < 8)}
            className="w-full"
          >
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
                ? "Sign in"
                : "Sign up"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

