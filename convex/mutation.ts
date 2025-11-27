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
    const noteId =  await ctx.db.insert("note", {
      title: args.title,
      body: args.body,
      createdAt: now,
    });
    console.log("Inserted note:", noteId, args.title);
    return noteId
  },
});

// export const updateNote = mutation({
//   args: { id: v.id("note") },
//   handler: async (ctx, args) => {
//     const { id } = args;

//     // Fetch the current note
//     console.log(await ctx.db.get(id));
//     // Example: { title: "My Note", body: "Hello world", createdAt: 123456789, _id: ... }

//     // Update fields: change title and body
//     await ctx.db.patch(id, {
//       title: "Updated Title",
//       body: "Updated body content",
//     });
//     console.log(await ctx.db.get(id));
//     // Example: { title: "Updated Title", body: "Updated body content", createdAt: 123456789, _id: ... }

//     // Unset a field (e.g., body) by setting it to undefined
//     await ctx.db.patch(id, { body: undefined });
//     console.log(await ctx.db.get(id));
//     // Example: { title: "Updated Title", createdAt: 123456789, _id: ... }
//   },
// });

// export const replaceNote = mutation({
//   args: { id: v.id("note") },
//   handler: async (ctx, args) => {
//     const { id } = args;

//     // Fetch the current note
//     console.log(await ctx.db.get(id));
//     // Example: { title: "My Note", body: "Hello world", createdAt: 123456789, _id: ... }

//     // Replace the whole document (only keep what you specify here)
//     await ctx.db.replace(id, {
//       title: "Replaced Title",
//       body: "Replaced body content",
//       createdAt: Date.now(),
//     });

//     console.log(await ctx.db.get(id));
//     // Example: { title: "Replaced Title", body: "Replaced body content", createdAt: 1700000000000, _id: ... }
//   },
// });

export const updateNote = mutation({
  args: {
    id: v.id("note"),
    title: v.optional(v.string()),   // optional so you can update only one field
    body: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, title, body } = args;

    // Build patch object dynamically
    const patch: Record<string, any> = {};
    if (title !== undefined) patch.title = title;
    if (body !== undefined) patch.body = body;

    await ctx.db.patch(id, patch);

    return await ctx.db.get(id); // return updated note
  },
});

export const replaceNote = mutation({
  args: {
    id: v.id("note"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, title, body } = args;

    // Replace entire document (must include all fields you want to keep)
    await ctx.db.replace(id, {
      title,
      body,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id); // return replaced note
  },
});


export const deleteNote = mutation({
  args: { id: v.id("note") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});