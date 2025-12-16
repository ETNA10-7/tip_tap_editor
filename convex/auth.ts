import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * Convex Auth config.
 * - Normalizes emails to lowercase to avoid duplicate / missing accounts.
 * - Leaves other defaults intact (no email verification or reset flows).
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        const email = (params.email as string | undefined)?.trim().toLowerCase();
        if (!email) {
          throw new Error("Email is required");
        }
        return { email };
      },
    }),
  ],
});

