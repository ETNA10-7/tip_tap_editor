"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Doc } from "@/convex/_generated/dataModel";
import { LogOut, User, Settings, Bookmark } from "lucide-react";

type User = Doc<"users"> | null | undefined;

interface ProfileMenuProps {
  user: User;
}

/**
 * Profile Menu Component
 * 
 * Displays a clickable avatar that opens a dropdown menu with:
 * - View Profile
 * - Edit Profile
 * - Logout
 */
export function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuthActions();
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
      // Force full page reload to clear all state and start fresh
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      // Even if there's an error, reload to clear state
      window.location.href = "/";
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push("/profile");
  };

  const handleEditProfileClick = () => {
    setIsOpen(false);
    router.push("/profile/edit");
  };

  const handleBookmarksClick = () => {
    setIsOpen(false);
    router.push("/bookmarks");
  };

  if (!user) {
    return null;
  }

  // Check if profile needs completion (no bio and no image)
  const needsProfileSetup = !user.bio && !user.image;

  return (
    <div className="relative" ref={menuRef}>
      {/* Clickable Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 rounded-full transition-transform hover:scale-105 active:scale-95"
        aria-label="Profile menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ProfileAvatar user={user} size="md" />
        {/* Active indicator ring when menu is open */}
        {isOpen && (
          <span className="absolute inset-0 rounded-full ring-2 ring-slate-900 ring-offset-2" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-50 transition-all duration-200 ease-out">
          <div className="py-1">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">View Profile</span>
            </button>

            <button
              onClick={handleEditProfileClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="relative flex-shrink-0 w-4 h-4 flex items-center justify-center">
                <Settings className="h-4 w-4" />
                {/* Red notification dot - shows when profile is incomplete */}
                {needsProfileSetup && (
                  <span 
                    className="absolute bg-red-500 rounded-full border-2 border-white shadow-sm" 
                    style={{ 
                      width: '8px',
                      height: '8px',
                      top: '-2px',
                      right: '-2px',
                    }}
                  />
                )}
              </div>
              <span className="flex-1 text-left">Edit Profile</span>
            </button>

            <button
              onClick={handleBookmarksClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                <Bookmark className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">My Bookmarks</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-slate-100" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

