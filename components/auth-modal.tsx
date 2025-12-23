"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuthActions();
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get redirect destination from URL params or default to current path
  const redirectTo = searchParams?.get("redirect") || (typeof window !== "undefined" ? window.location.pathname : "/");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setUsername("");
      setPassword("");
      setError(null);
      setSuccess(false);
      setShowPassword(false);
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Close modal and redirect when user is authenticated
  useEffect(() => {
    if (!isLoading && user && isOpen) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (redirectTo && redirectTo !== window.location.pathname) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      }, 500);
    }
  }, [isLoading, user, isOpen, onClose, redirectTo, router]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
        console.log("[AuthModal] ✅ Sign-in successful, session stored");
        setSuccess(true);
        setLoading(false);
        
        // Reload page to establish session
        setTimeout(() => {
          console.log("[AuthModal] Reloading page to establish session and route to:", redirectTo);
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

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md space-y-8 rounded-2xl border bg-white p-8 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

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
                <p>Redirecting...</p>
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
        </div>
      </div>
    </>
  );
}
