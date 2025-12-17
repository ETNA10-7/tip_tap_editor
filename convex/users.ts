import { query } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

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

