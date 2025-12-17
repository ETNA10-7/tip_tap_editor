import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * Convex Auth configuration with Password provider.
 * 
 * The profile function is called during signup/signin to extract user information.
 * It should return an object with at least an 'email' field, and optionally 'name'.
 * 
 * Convex Auth automatically:
 * - Creates users in the 'users' table
 * - Creates accounts in the 'authAccounts' table
 * - Links them via authAccounts.userId -> users._id
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        // Normalize email to lowercase to prevent duplicate accounts
        const email = String(params.email || "").trim().toLowerCase();
        
        if (!email) {
          throw new Error("Email is required");
        }
        
        // Extract name from username param or use email prefix as fallback
        const usernameParam = params.username;
        const username = usernameParam ? String(usernameParam).trim() : "";
        const name = username || email.split("@")[0] || "User";
        
        // Return profile object - Convex Auth will create the user automatically
        // The profile must match the users table schema from authTables
        // Required: email
        // Optional: name, image, etc.
        return {
          email: email,
          name: name,
        };
      },
    }),
  ],
});

