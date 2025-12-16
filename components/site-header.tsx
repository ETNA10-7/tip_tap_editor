 "use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/create", label: "Write" },
];

export function SiteHeader() {
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.me) as Doc<"users"> | null | undefined;
  const isAuthenticated = me !== null;

  const avatarLetter = useMemo(() => {
    const email = me?.email as string | undefined;
    if (!email) return "U";
    return email[0]?.toUpperCase() ?? "U";
  }, [me]);

  return (
    <header className="border-b bg-white/90 backdrop-blur">
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
          {isAuthenticated ? (
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                  {avatarLetter}
                </span>
                <span className="text-muted-foreground">
                  {me?.email ?? "Account"}
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-40 rounded-xl border bg-white p-2 shadow-lg">
                <button
                  onClick={() => signOut()}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </details>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border px-4 py-2 text-sm font-semibold"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}




