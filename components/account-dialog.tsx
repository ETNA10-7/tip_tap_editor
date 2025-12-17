"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, LogOut, LogIn, UserPlus, KeyRound } from "lucide-react";

type AccountDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AccountDialog({ isOpen, onClose }: AccountDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        // Check if click is on auth modal
        const target = event.target as HTMLElement;
        if (target.closest('[class*="z-[60]"]')) {
          return; // Don't close if clicking on auth modal
        }
        onClose();
      }
    };
    if (isOpen) {
      // Small delay to prevent immediate close
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get user's full name from users table (required field)
  const userName = user?.name as string | undefined;
  const userEmail = user?.email as string | undefined;
  
  // Avatar letter is first letter of name (uppercase)
  const avatarLetter = userName?.[0]?.toUpperCase() ?? "U";

  const handleLogout = async () => {
    try {
      // Close dialog first
      onClose();
      // Sign out using Convex Auth
      await signOut();
      // Force page reload to ensure UI updates immediately
      // This clears all cached state and refetches queries
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      // Even if there's an error, reload to clear state
      window.location.href = "/";
    }
  };


  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="fixed right-4 top-16 z-50 w-80 rounded-2xl border bg-white shadow-2xl"
      >
        {isAuthenticated && user ? (
          // Authenticated state - show user info and logout
          <div className="p-4">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3 border-b pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {avatarLetter}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                {userEmail && (
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-muted-foreground transition hover:bg-slate-100 flex-shrink-0"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Account label */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Account</h2>
            </div>

            {/* User's full name */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{userName}</p>
            </div>

            {/* Logout button */}
            <div className="border-t pt-4">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex w-full items-center justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </Button>
            </div>
          </div>
        ) : (
          // Not authenticated state - show sign in / sign up options
          <div className="p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-semibold">Account</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-muted-foreground transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sign in / Sign up options */}
            <div className="space-y-2">
              <Link href="/auth" onClick={onClose}>
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-start gap-3"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign up</span>
                </Button>
              </Link>

              <Link href="/auth" onClick={onClose}>
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-start gap-3"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign in</span>
                </Button>
              </Link>

              <Button
                onClick={() => {
                  setForgotPasswordOpen(true);
                  onClose();
                }}
                variant="ghost"
                className="flex w-full items-center justify-start gap-3 text-muted-foreground"
              >
                <KeyRound className="h-4 w-4" />
                <span>Forgot password?</span>
              </Button>
            </div>
          </div>
        )}
        </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setForgotPasswordOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-8 shadow-2xl mx-4">
            <button
              onClick={() => setForgotPasswordOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Reset Password</h2>
              <p className="text-sm text-muted-foreground">
                Password reset functionality will be available soon. For now, please contact support or create a new account.
              </p>
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

