import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { generateUsernameSlug } from "./utils";

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
 * 
 * Note: Username is auto-generated from name/email but uniqueness is not checked here.
 * Users can update their username later via the updateUsername mutation.
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
        
        // Generate a username slug from name or email
        // This will be set initially, but users can update it later
        // Uniqueness is not checked here (can't access DB in profile function)
        const usernameSlug = generateUsernameSlug(name || email.split("@")[0] || "user");
        
        // Return profile object - Convex Auth will create the user automatically
        // The profile must match the users table schema from authTables
        // Required: email
        // Optional: name, image, username, etc.
        return {
          email: email,
          name: name,
          username: usernameSlug, // Auto-generate username from name/email
        };
      },
    }),
  ],
});

