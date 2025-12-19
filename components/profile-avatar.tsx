"use client";

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

  // Generate a color based on user's name/email for consistent avatar colors
  const getAvatarColor = (text: string): string => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
      "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
      "bg-gradient-to-br from-pink-500 to-pink-600 text-white",
      "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white",
      "bg-gradient-to-br from-green-500 to-green-600 text-white",
      "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
      "bg-gradient-to-br from-teal-500 to-teal-600 text-white",
      "bg-gradient-to-br from-red-500 to-red-600 text-white",
    ];
    // Use first character to pick a consistent color
    const index = (text.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const avatarColor = hasImage 
    ? "" 
    : getAvatarColor(user?.name || user?.email || "?");

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

