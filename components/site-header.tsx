"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile-menu";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/create", label: "Write" },
];

export function SiteHeader() {
  const { user } = useAuth();

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
            // Show profile menu with dropdown when authenticated
            <ProfileMenu user={user} />
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




