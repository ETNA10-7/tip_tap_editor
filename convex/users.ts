import { query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Return the currently authenticated user document.
 */
export const me = query(async (ctx) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
});

