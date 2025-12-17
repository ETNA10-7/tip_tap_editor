"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo, useEffect } from "react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

/**
 * Convex Client Provider for Next.js App Router.
 * 
 * Uses ConvexAuthProvider which handles session token storage and automatically sends it with queries.
 * 
 * CRITICAL: 
 * - ConvexAuthProvider MUST wrap ConvexProvider
 * - ConvexAuthProvider automatically reads tokens from localStorage using storageNamespace (client.address)
 * - Tokens are stored as: __convexAuthJWT_{storageNamespace} and __convexAuthRefreshToken_{storageNamespace}
 * - The JWT token is automatically sent with all WebSocket queries
 * 
 * @see https://labs.convex.dev/auth/api_reference/react#convexauthactionscontext
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Create Convex client - MUST be stable (use useMemo with empty deps)
  // ConvexAuthProvider will automatically read tokens from localStorage and inject them
  const convex = useMemo(
    () => {
      const client = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      
      // Debug: Check if auth tokens exist in localStorage after page load
      if (typeof window !== "undefined") {
        // The storage namespace is based on client.address
        // Check for tokens with the expected namespace pattern
        const allKeys = Object.keys(localStorage);
        const authKeys = allKeys.filter(k => k.includes("convexAuthJWT") || k.includes("convexAuthRefreshToken"));
        
        if (authKeys.length > 0) {
          console.log("[ConvexClientProvider] ✅ Auth tokens found in localStorage:", authKeys);
          authKeys.forEach(key => {
            const token = localStorage.getItem(key);
            console.log(`[ConvexClientProvider] Token ${key}:`, token ? `${token.substring(0, 20)}...` : "null");
          });
        } else {
          console.log("[ConvexClientProvider] ⚠️ No auth tokens found in localStorage");
        }
      }
      
      return client;
    },
    []
  );

  // CRITICAL: ConvexAuthProvider MUST wrap ConvexProvider
  // ConvexAuthProvider:
  // 1. Reads JWT and refresh tokens from localStorage (key: __convexAuthJWT_{client.address})
  // 2. Automatically injects JWT token into WebSocket connection headers
  // 3. Automatically refreshes tokens when they expire
  // 4. The same client instance must be used for both providers
  return (
    <ConvexAuthProvider client={convex}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ConvexAuthProvider>
  );
}