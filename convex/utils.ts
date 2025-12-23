/**
 * Slug generation utility for creating URL-friendly strings from titles.
 * 
 * Converts titles to lowercase, removes special characters,
 * replaces spaces with hyphens, and trims extra hyphens.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and multiple spaces with single hyphen
    .replace(/\s+/g, "-")
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, "")
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Ensure slug is not empty (fallback to "post" if empty)
    || "post";
}

/**
 * Generate a username slug from a name or email.
 * Used for creating URL-friendly usernames.
 */
export function generateUsernameSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and multiple spaces with single hyphen
    .replace(/\s+/g, "-")
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, "")
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Ensure username is not empty
    || "user";
}

/**
 * Validate username format.
 * Rules:
 * - 3-30 characters long
 * - Only lowercase letters, numbers, and hyphens
 * - Cannot start or end with hyphen
 * - Cannot contain consecutive hyphens
 * 
 * @param username - The username to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const trimmed = username.trim().toLowerCase();
  
  // Check length
  if (trimmed.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters long" };
  }
  if (trimmed.length > 30) {
    return { isValid: false, error: "Username must be no more than 30 characters long" };
  }
  
  // Check format: only lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return { isValid: false, error: "Username can only contain lowercase letters, numbers, and hyphens" };
  }
  
  // Cannot start or end with hyphen
  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return { isValid: false, error: "Username cannot start or end with a hyphen" };
  }
  
  // Cannot contain consecutive hyphens
  if (trimmed.includes("--")) {
    return { isValid: false, error: "Username cannot contain consecutive hyphens" };
  }
  
  // Reserved usernames (add more as needed)
  const reserved = ["admin", "api", "www", "mail", "root", "anonymous", "null", "undefined", "me", "profile", "settings", "auth", "login", "signup", "logout"];
  if (reserved.includes(trimmed)) {
    return { isValid: false, error: "This username is reserved and cannot be used" };
  }
  
  return { isValid: true };
}

/**
 * Ensure username is unique by appending numbers if needed.
 * 
 * @param ctx - Database context
 * @param baseUsername - The base username to check
 * @param excludeUserId - Optional user ID to exclude from uniqueness check (for updates)
 * @returns Unique username
 */
export async function ensureUniqueUsername(
  ctx: { db: any },
  baseUsername: string,
  excludeUserId?: string
): Promise<string> {
  let username = baseUsername.toLowerCase().trim();
  let counter = 1;

  while (true) {
    const existing = await ctx.db
      .query("users")
      .withIndex("username", (q: any) => q.eq("username", username))
      .first();

    // If no existing user found, or if it's the same user (for updates), username is unique
    if (!existing || (excludeUserId && existing._id === excludeUserId)) {
      return username;
    }

    // Collision found, append counter
    username = `${baseUsername}-${counter}`;
    counter++;
    
    // Safety check: prevent infinite loop
    if (counter > 1000) {
      // Fallback: append timestamp
      username = `${baseUsername}-${Date.now()}`;
      break;
    }
  }

  return username;
}




