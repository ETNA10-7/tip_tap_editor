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
  const [view, setView] = useState<"login" | "signup" | "forgot" | "reset-verification">(initialMode);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Get redirect destination from URL params or default to current path
  const redirectTo = searchParams?.get("redirect") || (typeof window !== "undefined" ? window.location.pathname : "/");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setUsername("");
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setError(null);
      setSuccess(false);
      setShowPassword(false);
      setShowNewPassword(false);
      setResetEmailSent(false);
      setView(initialMode);
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
      if (view === "forgot") {
        // Request password reset code
        await signIn("password", {
          flow: "reset",
          email: email.trim().toLowerCase(),
        });
        setResetEmailSent(true);
        setLoading(false);
        return;
      } else if (view === "reset-verification") {
        // Verify reset code and set new password
        const result = await signIn("password", {
          flow: "reset-verification",
          email: email.trim().toLowerCase(),
          code: resetCode.trim(),
          newPassword,
        });

        if (result.signingIn) {
          console.log("[AuthModal] ✅ Password reset successful, session stored");
          setSuccess(true);
          setLoading(false);
          
          // Reload page to establish session
          setTimeout(() => {
            console.log("[AuthModal] Reloading page to establish session and route to:", redirectTo);
            window.location.href = redirectTo;
          }, 200);
          return;
        }
      } else {
        // Regular sign in or sign up
        const result = await signIn("password", {
          flow: view === "login" ? "signIn" : "signUp",
          email: email.trim().toLowerCase(),
          password,
          ...(view === "signup" && username.trim() ? { username: username.trim() } : {}),
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
      }
    } catch (err) {
      console.error("Auth error:", err);
      let message = err instanceof Error ? err.message : `Failed to ${view === "login" ? "sign in" : view === "signup" ? "sign up" : "reset password"}.`;
      
      // Provide user-friendly error messages
      if (message.includes("InvalidSecret")) {
        message = "Invalid email or password. Please check your credentials and try again.";
      } else if (message.includes("InvalidAccountId")) {
        message = "Account not found. Please sign up first.";
      } else if (message.includes("already exists")) {
        message = "Account already exists. Please sign in instead.";
      } else if (message.includes("invalid password") || message.includes("password")) {
        message = "Password must be at least 8 characters long.";
      } else if (message.includes("code") || message.includes("Code") || message.includes("verification")) {
        message = "Invalid reset code. Please check your email and try again.";
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
              {view === "login" 
                ? "Welcome back" 
                : view === "signup"
                ? "Create account"
                : view === "forgot"
                ? "Reset password"
                : "Enter reset code"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === "login"
                ? "Sign in to your Mediumish account"
                : view === "signup"
                ? "Sign up to start writing"
                : view === "forgot"
                ? "Enter your email to receive a reset code"
                : "Enter the code sent to your email and your new password"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Signup username field */}
            {view === "signup" && (
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

            {/* Email field (always shown) */}
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
                disabled={loading || resetEmailSent}
              />
            </div>

            {/* Reset code field (only for reset-verification) */}
            {view === "reset-verification" && (
              <div className="space-y-2">
                <label htmlFor="resetCode" className="text-sm font-medium">
                  Reset code
                </label>
                <Input
                  id="resetCode"
                  type="text"
                  placeholder="Enter the code from your email"
                  value={resetCode}
                  onChange={(e) => {
                    // Remove any spaces from the reset code (codes don't contain spaces)
                    const cleaned = e.target.value.replace(/\s/g, "");
                    setResetCode(cleaned);
                  }}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Check your email for the reset code
                </p>
              </div>
            )}

            {/* Password field (for login/signup) */}
            {(view === "login" || view === "signup") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  {view === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setView("forgot");
                        setError(null);
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      view === "login"
                        ? "Enter your password"
                        : "Enter password (min 8 characters)"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={view === "signup" ? 8 : undefined}
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
                {view === "signup" && (
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                )}
              </div>
            )}

            {/* New password field (for reset-verification) */}
            {view === "reset-verification" && (
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>
            )}

            {resetEmailSent && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-600">
                <p className="font-medium">Reset code generated!</p>
                <p className="mt-1">
                  <strong>Development Mode:</strong> Check your Convex dashboard logs for the reset code.
                </p>
                <p className="mt-1 text-xs">
                  In production, this code would be sent to your email. Click "Enter code" below to continue.
                </p>
              </div>
            )}

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
                {view === "login" && error.includes("Invalid email or password") && (
                  <p className="mt-2 text-xs">
                    Don't remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setView("forgot");
                        setError(null);
                      }}
                      className="underline"
                    >
                      Reset it here
                    </button>
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={
                loading || 
                (view === "signup" && password.length < 8) ||
                (view === "reset-verification" && (newPassword.length < 8 || !resetCode.trim()))
              }
              className="w-full"
            >
              {loading
                ? view === "login"
                  ? "Signing in..."
                  : view === "signup"
                  ? "Creating account..."
                  : view === "forgot"
                  ? "Sending code..."
                  : "Resetting password..."
                : view === "login"
                  ? "Sign in"
                  : view === "signup"
                  ? "Sign up"
                  : view === "forgot"
                  ? "Send reset code"
                  : "Reset password"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {view === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    setError(null);
                  }}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : view === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError(null);
                  }}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : view === "forgot" ? (
              <>
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError(null);
                    setResetEmailSent(false);
                  }}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign in
                </button>
                {resetEmailSent && (
                  <>
                    {" • "}
                    <button
                      type="button"
                      onClick={() => {
                        setView("reset-verification");
                        setError(null);
                      }}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      Enter code
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot");
                    setError(null);
                    setResetCode("");
                    setNewPassword("");
                  }}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  ← Back to reset request
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
