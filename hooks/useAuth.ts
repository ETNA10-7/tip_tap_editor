"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

/**
 * Custom hook that wraps Convex Auth authentication state.
 * 
 * Returns:
 * - `user`: The authenticated user document, or null if not authenticated, or undefined if loading
 * - `isAuthenticated`: Boolean indicating if user is authenticated (true when user is not null and not undefined)
 * - `isLoading`: Boolean indicating if auth state is still loading
 * 
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, isLoading } = useAuth();
 * 
 * if (isLoading) return <Loading />;
 * if (!isAuthenticated) return <SignIn />;
 * return <Dashboard user={user} />;
 * ```
 */
/**
 * Custom hook that wraps Convex Auth authentication state.
 * 
 * CRITICAL: This hook ensures user is never null when isAuthenticated === true.
 * 
 * Returns:
 * - `user`: The authenticated user document, or null if not authenticated, or undefined if loading
 * - `isAuthenticated`: Boolean - ONLY true when user is an actual object (not null, not undefined)
 * - `isLoading`: Boolean - true when query is still loading (user === undefined)
 * 
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, isLoading } = useAuth();
 * 
 * if (isLoading) return <Loading />;
 * if (!isAuthenticated) return <SignIn />;
 * return <Dashboard user={user} />; // user is guaranteed to be non-null here
 * ```
 */
export function useAuth() {
  // Always call the query - don't skip it
  // The query will return:
  // - undefined: query is still loading
  // - null: not authenticated (no valid session)
  // - User object: authenticated (user document exists)
  const user = useQuery(api.users.getCurrentUser) as Doc<"users"> | null | undefined;
  
  // CRITICAL: Only consider authenticated when user is an actual object
  // user === undefined: query is still loading
  // user === null: not authenticated (no session or invalid session)
  // user is an object: authenticated (user document exists and is valid)
  const isAuthenticated = user !== null && user !== undefined;
  const isLoading = user === undefined;
  
  // Log user state for debugging
  if (!isLoading) {
    if (user) {
      console.log("[useAuth] ✅ User authenticated:", {
        email: user.email,
        name: user.name,
        _id: user._id,
      });
    } else {
      console.log("[useAuth] ❌ User not authenticated - user is null");
    }
  }
  
  // Ensure user is never null when isAuthenticated is true
  // This is a safety check - if this fails, there's a bug in getCurrentUser
  if (isAuthenticated && !user) {
    console.error("[useAuth] ❌ CRITICAL ERROR: isAuthenticated is true but user is null/undefined");
    console.error("[useAuth] This should never happen - there's a bug in the auth flow");
  }
  
  return {
    user: isAuthenticated ? user : null, // Ensure user is null when not authenticated
    isAuthenticated,
    isLoading,
  };
}

