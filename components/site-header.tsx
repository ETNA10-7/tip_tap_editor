"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/create", label: "Write" },
];

export function SiteHeader() {
  const { user } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      // Force full page reload to clear all state and start fresh
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      // Even if there's an error, reload to clear state
      window.location.href = "/";
    }
  };

  return (
    <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Mediumish
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            // Show logout button when authenticated
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-full"
            >
              Logout
            </Button>
          ) : (
            // Show sign in / sign up button when not authenticated
            <Link href="/auth">
              <Button variant="outline" className="rounded-full">
                Sign in / Sign up
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}




