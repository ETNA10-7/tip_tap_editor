import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { validateUsername, ensureUniqueUsername } from "./utils";

/**
 * Check if a session exists and get the userId.
 * Uses auth.getUserId() from the auth object returned by convexAuth().
 */
export const checkSession = query(async (ctx) => {
  // Use auth.getUserId() - this uses ctx.auth.getUserIdentity() under the hood
  const userId = await auth.getUserId(ctx);
  
  if (!userId) {
    console.log("[checkSession] ❌ No userId found - user not authenticated");
    return null;
  }
  
  console.log("[checkSession] ✅ User authenticated, userId:", userId);
  return { userId };
});

/**
 * Return the currently authenticated user document.
 * 
 * CRITICAL: This ensures user is never null when authenticated.
 * Uses auth.getUserId() which returns the userId (users table _id) directly.
 * 
 * Returns:
 * - null if not authenticated
 * - User document if authenticated
 */
/**
 * Get current authenticated user from Convex database.
 * Similar to Express middleware pattern: checks if user exists in DB.
 * 
 * Flow:
 * 1. Get userId from auth session (like JWT token in Express)
 * 2. Query users table to find user by _id (like User.findOne({ _id: req.userId }))
 * 3. Return user if exists, null if not found or not authenticated
 */
/**
 * Get current authenticated user from Convex database.
 * 
 * Uses auth.getUserId() from the auth object returned by convexAuth().
 * This uses ctx.auth.getUserIdentity() under the hood.
 * 
 * Flow:
 * 1. Get userId using auth.getUserId() - this uses ctx.auth.getUserIdentity() under the hood
 * 2. Query users table to find user by _id (like User.findOne({ _id: req.userId }))
 * 3. Return user if exists, null if not found or not authenticated
 */
/**
 * Get current authenticated user from Convex database.
 * 
 * CRITICAL: This function MUST return a user object when authenticated, NEVER null.
 * If auth.getUserId() returns a userId, the user MUST exist in the database.
 * 
 * Flow:
 * 1. Get userId using auth.getUserId() - this uses ctx.auth.getUserIdentity() under the hood
 * 2. Query users table to find user by _id
 * 3. Return user if exists, null ONLY if not authenticated
 */
export const getCurrentUser = query(async (ctx) => {
  // Step 1: Get userId using auth.getUserId() - this uses ctx.auth.getUserIdentity() under the hood
  // Returns the user ID or null if the client isn't authenticated
  const userId = await auth.getUserId(ctx);
  
  if (!userId) {
    // User is not authenticated - log for debugging to see if session token is being sent
    console.log("[getCurrentUser] ❌ No userId found - session token not sent with query");
    console.log("[getCurrentUser] This means ConvexAuthProvider is not sending session token with the query");
    console.log("[getCurrentUser] Check if session token is stored in localStorage after page reload");
    return null;
  }
  
  // Step 2: Query users table to check if user exists
  // CRITICAL: If userId exists, the user MUST exist in the database
  // If user doesn't exist, this is a critical error - the auth system is broken
  const user = await ctx.db.get(userId);
  
  if (!user) {
    // CRITICAL ERROR: User was authenticated (userId exists) but user document doesn't exist
    // This should NEVER happen if auth is working correctly
    // This means the user was created in authAccounts but not in users table
    console.error("[getCurrentUser] ❌ CRITICAL ERROR: User authenticated but document not found!");
    console.error("[getCurrentUser] userId:", userId);
    console.error("[getCurrentUser] This means auth system is broken - user exists in authAccounts but not in users table");
    throw new Error("User authenticated but user document not found in database. This is a critical error.");
  }
  
  // Step 3: User exists - log user info and return
  // CRITICAL: We MUST return the user object, NEVER null when authenticated
  console.log("[getCurrentUser] ✅ USER EXISTS - User found in database:");
  console.log("[getCurrentUser] User info:", {
    _id: user._id,
    email: user.email,
    name: user.name,
  });
  
  // CRITICAL: Return user object - this ensures user is NEVER null when authenticated
  return user;
});

/**
 * Alias for getCurrentUser - returns the current authenticated user.
 * This is the primary query used by useAuth hook.
 */
export const me = getCurrentUser;

/**
 * Update the current user's profile.
 * 
 * Only the authenticated user can update their own profile.
 * 
 * @param args.name - Optional: Update user's name
 * @param args.image - Optional: Update user's profile picture URL
 * @param args.bio - Optional: Update user's biography/description
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user ID
    const userId = await auth.getUserId(ctx);
    
    if (!userId) {
      throw new Error("Not authenticated. Please sign in to update your profile.");
    }
    
    // Get the current user document
    const user = await ctx.db.get(userId);
    
    if (!user) {
      throw new Error("User not found in database.");
    }
    
    // Build update object with only provided fields
    const updates: {
      name?: string;
      image?: string;
      bio?: string;
    } = {};
    
    if (args.name !== undefined) {
      updates.name = args.name.trim() || undefined;
    }
    
    if (args.image !== undefined) {
      updates.image = args.image.trim() || undefined;
    }
    
    if (args.bio !== undefined) {
      updates.bio = args.bio.trim() || undefined;
    }
    
    // Update the user document
    await ctx.db.patch(userId, updates);
    
    console.log("[updateProfile] ✅ Profile updated for user:", userId);
    console.log("[updateProfile] Updates:", updates);
    
    // Return the updated user document
    return await ctx.db.get(userId);
  },
});

/**
 * Get user by username.
 * 
 * Searches for a user by their username field first.
 * If not found, generates a slug from name/email and matches against that.
 * This allows backward compatibility for users without explicit usernames.
 * 
 * @param args.username - The username to search for
 * @returns User document with author info, or null if not found
 */
export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const searchUsername = args.username.toLowerCase().trim();
    
    if (!searchUsername) {
      return null;
    }

    // First, try to find by explicit username field
    const userByUsername = await ctx.db
      .query("users")
      .withIndex("username", (q: any) => q.eq("username", searchUsername))
      .first();

    if (userByUsername) {
      return userByUsername;
    }

    // If not found, search all users and match by generated slug
    // This allows backward compatibility for users without explicit usernames
    const allUsers = await ctx.db.query("users").collect();
    
    for (const user of allUsers) {
      // Generate slug from name or email
      let generatedSlug = "";
      if (user.name) {
        generatedSlug = user.name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");
      } else if (user.email) {
        // Use email prefix (part before @)
        const emailPrefix = user.email.split("@")[0];
        generatedSlug = emailPrefix
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      if (generatedSlug === searchUsername) {
        return user;
      }
    }

    return null;
  },
});

/**
 * Update the current user's username.
 * 
 * Only the authenticated user can update their own username.
 * Validates username format and ensures uniqueness.
 * 
 * @param args.username - The new username (must be 3-30 chars, lowercase, alphanumeric + hyphens)
 * @returns Updated user document
 */
export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user ID
    const userId = await auth.getUserId(ctx);
    
    if (!userId) {
      throw new Error("Not authenticated. Please sign in to update your username.");
    }
    
    // Get the current user document
    const user = await ctx.db.get(userId);
    
    if (!user) {
      throw new Error("User not found in database.");
    }
    
    // Validate username format
    const validation = validateUsername(args.username);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid username format");
    }
    
    // Normalize username (lowercase, trimmed)
    const normalizedUsername = args.username.trim().toLowerCase();
    
    // Ensure username is unique (excluding current user)
    const uniqueUsername = await ensureUniqueUsername(ctx, normalizedUsername, userId);
    
    // Update the user document
    await ctx.db.patch(userId, {
      username: uniqueUsername,
    });
    
    console.log("[updateUsername] ✅ Username updated for user:", userId);
    console.log("[updateUsername] New username:", uniqueUsername);
    
    // Return the updated user document
    return await ctx.db.get(userId);
  },
});

/**
 * Check if a username is available.
 * 
 * @param args.username - The username to check
 * @returns Object with available boolean and message
 */
export const checkUsernameAvailability = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    // Validate username format first
    const validation = validateUsername(args.username);
    if (!validation.isValid) {
      return {
        available: false,
        message: validation.error || "Invalid username format",
      };
    }
    
    const normalizedUsername = args.username.trim().toLowerCase();
    
    // Check if username exists
    const existing = await ctx.db
      .query("users")
      .withIndex("username", (q: any) => q.eq("username", normalizedUsername))
      .first();
    
    if (existing) {
      return {
        available: false,
        message: "This username is already taken",
      };
    }
    
    return {
      available: true,
      message: "Username is available",
    };
  },
});

