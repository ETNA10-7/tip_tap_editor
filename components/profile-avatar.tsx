"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

/**
 * Profile Avatar Component
 * 
 * Displays a user's profile picture or falls back to their initials.
 * 
 * @param user - User document with name, image, and email fields
 * @param size - Size of the avatar (default: "md")
 * @param className - Additional CSS classes
 * @param showFallback - Whether to show fallback initials (default: true)
 */
type User = Doc<"users"> | null | undefined;

interface ProfileAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showFallback?: boolean;
}

/**
 * Get the first letter(s) of a name for avatar fallback.
 * For names like "Gaurav", returns "G".
 * For names like "John Doe", returns "JD".
 */
function getInitials(name: string | null | undefined): string {
  if (!name || name.trim().length === 0) {
    return "?";
  }

  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    // Single name: return first letter
    return trimmed.charAt(0).toUpperCase();
  } else {
    // Multiple words: return first letter of first and last word
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}

/**
 * Get fallback text for avatar when no name is available.
 * Uses first letter of email or "?" as last resort.
 */
function getFallbackText(user: User): string {
  if (user?.name) {
    return getInitials(user.name);
  }
  if (user?.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return "?";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function ProfileAvatar({
  user,
  size = "md",
  className,
  showFallback = true,
}: ProfileAvatarProps) {
  const sizeClass = sizeClasses[size];
  const fallbackText = getFallbackText(user);
  const hasImage = user?.image && user.image.trim().length > 0;

  // Generate RGB-based color based on user's name/email
  // Only uses: Red, Green, Blue, Black, and Grey shades
  const getAvatarColor = (text: string): string => {
    // Create a hash from the text for consistent color assignment
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return `text-white`;
  };

  const getAvatarStyle = (text: string): React.CSSProperties | undefined => {
    if (hasImage) return undefined;
    
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Color palette: Only Red, Green, Blue, Black, and Grey shades
    const colors = [
      { from: "rgb(59, 130, 246)", to: "rgb(37, 99, 235)" }, // Blue
      { from: "rgb(96, 165, 250)", to: "rgb(59, 130, 246)" }, // Light Blue
      { from: "rgb(34, 197, 94)", to: "rgb(22, 163, 74)" }, // Green
      { from: "rgb(74, 222, 128)", to: "rgb(34, 197, 94)" }, // Light Green
      { from: "rgb(239, 68, 68)", to: "rgb(220, 38, 38)" }, // Red
      { from: "rgb(248, 113, 113)", to: "rgb(239, 68, 68)" }, // Light Red
      { from: "rgb(0, 0, 0)", to: "rgb(30, 30, 30)" }, // Black
      { from: "rgb(107, 114, 128)", to: "rgb(75, 85, 99)" }, // Grey Matte
      { from: "rgb(156, 163, 175)", to: "rgb(107, 114, 128)" }, // Light Grey Matte
    ];
    
    const index = Math.abs(hash) % colors.length;
    const color = colors[index];
    
    return {
      background: `linear-gradient(to bottom right, ${color.from}, ${color.to})`,
    };
  };

  const avatarColor = hasImage 
    ? "" 
    : getAvatarColor(user?.name || user?.email || "?");
  const avatarStyle = getAvatarStyle(user?.name || user?.email || "?");

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full overflow-hidden",
        "ring-2 ring-white shadow-sm",
        "transition-all duration-200",
        sizeClass,
        hasImage ? "" : avatarColor,
        className
      )}
      style={avatarStyle}
      role="img"
      aria-label={user?.name || user?.email || "User avatar"}
    >
      {hasImage ? (
        // Show profile picture if available
        <img
          src={user.image!}
          alt={user?.name || user?.email || "Profile picture"}
          className="h-full w-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show fallback
            e.currentTarget.style.display = "none";
          }}
        />
      ) : showFallback ? (
        // Show initials fallback with nice styling
        <span className="select-none font-semibold">{fallbackText}</span>
      ) : null}
    </div>
  );
}

