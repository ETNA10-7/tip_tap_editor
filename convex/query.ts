// convex/query.ts
// import { query } from "./_generated/server";

// export const getNotes = query(async (ctx) => {
//   return await ctx.db.query("note").order("desc").collect();
// });
import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all notes
export const getNotes = query(async (ctx) => {
    return await ctx.db.query("note").order("desc").collect();
  });

  //Get notes by ID
export const getNoteById = query({
  args: { id: v.id("note") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
