import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { generateUsernameSlug } from "./utils";

/**
 * Password Reset Provider Configuration
 * 
 * DEVELOPMENT MODE: This provider logs the reset code to the console.
 * For production, replace this with a proper email service like Resend.
 * 
 * To set up Resend for production:
 * 1. Install: npm install resend
 * 2. Get API key from https://resend.com
 * 3. Add RESEND_API_KEY to your Convex environment variables
 * 4. Replace this provider with the Resend configuration (see docs)
 */
const PasswordResetProvider = {
  id: "password-reset",
  type: "email" as const,
  name: "Password Reset",
  from: "noreply@mediumish.com",
  maxAge: 60 * 15, // 15 minutes
  options: {},
  sendVerificationRequest: async ({
    identifier: email,
    provider,
    token,
  }: {
    identifier: string;
    provider: { from: string };
    token: string;
  }) => {
    // DEVELOPMENT: Log to console (check your Convex dashboard logs)
    console.log("=".repeat(50));
    console.log("🔐 PASSWORD RESET CODE");
    console.log("=".repeat(50));
    console.log(`Email: ${email}`);
    console.log(`Reset Code: ${token}`);
    console.log(`Expires in: 15 minutes`);
    console.log("=".repeat(50));
    console.log("NOTE: In production, this should send an email via Resend or similar service.");
    console.log("=".repeat(50));
    
    // TODO: For production, uncomment and configure Resend:
    /*
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: provider.from,
        to: email,
        subject: "Reset your password - Mediumish",
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Use the code below:</p>
          <h3 style="font-size: 24px; letter-spacing: 4px; color: #000;">${token}</h3>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      }),
    });
    */
  },
};

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
      reset: PasswordResetProvider, // Enable password reset
    }),
  ],
});

