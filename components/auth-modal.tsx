"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Eye, EyeOff } from "lucide-react";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
  onSwitchMode: () => void;
  onAuthSuccess?: () => void;
};

export function AuthModal({ isOpen, onClose, mode, onSwitchMode, onAuthSuccess }: AuthModalProps) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setUsername("");
      setPassword("");
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen, mode]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("password", {
        flow: mode === "login" ? "signIn" : "signUp",
        email: email.trim().toLowerCase(),
        password,
        ...(mode === "signup" && username.trim() ? { username: username.trim() } : {}),
      });

      if (result.signingIn) {
        console.log("[AuthModal] Login successful! Session stored.");
        // Close modal immediately
        onClose();
        // Notify parent that auth was successful
        if (onAuthSuccess) {
          onAuthSuccess();
        }
        // Wait for Convex Auth to fully store the session token in localStorage
        // Then force a full page reload to ensure Convex client picks up the new token
        setTimeout(() => {
          console.log("[AuthModal] Reloading page to update UI with new auth state...");
          // Use window.location.href for a complete reload that reinitializes everything
          window.location.href = window.location.origin + window.location.pathname;
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : `Failed to ${mode === "login" ? "sign in" : "sign up"}.`;
      if (message.toLowerCase().includes("invalidaccountid")) {
        setError(mode === "login" ? "Account not found. Please sign up first." : "Sign up failed. Please retry.");
      } else if (message.toLowerCase().includes("invalid credentials") || message.toLowerCase().includes("invalidsecret")) {
        setError("Invalid email or password.");
      } else if (message.toLowerCase().includes("already exists")) {
        setError("Account already exists. Please log in instead.");
      } else if (message.toLowerCase().includes("invalid password") || (password.length < 8 && mode === "signup")) {
        setError("Password must be at least 8 characters long.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Prevent closing when clicking inside modal - use stopPropagation instead
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        ref={modalRef} 
        onClick={handleModalClick}
        className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-8 shadow-2xl mx-4"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to your Mediumish account"
                : "Welcome! Please fill in the details to get started."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                placeholder="Enter your email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder={
                    mode === "login"
                      ? "Enter your password"
                      : "Enter your password (min 8 characters)"
                  }
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  disabled={loading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              )}
            </div>

            {error ? (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={loading || (mode === "signup" && password.length < 8)}
              className="w-full"
            >
              {loading
                ? mode === "login"
                  ? "Signing in…"
                  : "Creating account…"
                : "Continue"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchMode}
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
                  onClick={onSwitchMode}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

