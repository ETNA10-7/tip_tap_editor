// convex/documents.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
export const insertNote = mutation({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("note", {
      title: args.title,
      body: args.body,
      createdAt: now,
    });
  },
});
