"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Doc } from "@/convex/_generated/dataModel";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.me) as Doc<"users"> | null | undefined;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!me) return null;

  const email = me.email as string | undefined;
  const username = (me.name as string | undefined) || email?.split("@")[0] || "User";
  const avatarLetter = email?.[0]?.toUpperCase() ?? username[0]?.toUpperCase() ?? "U";
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm font-medium transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {avatarLetter}
        </span>
        <span className="hidden text-foreground sm:inline">{displayName}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border bg-white p-1 shadow-lg">
          {/* Welcome section */}
          <div className="px-3 py-3 border-b">
            <p className="text-xs font-medium text-muted-foreground">Welcome</p>
            <p className="text-lg font-semibold text-foreground">Welcome, {displayName}!</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/auth/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-slate-50"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Profile</span>
            </Link>
            <Link
              href="/auth/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Account Settings</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
