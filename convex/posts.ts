import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";

/**
 * Post creation. Generates an excerpt automatically if not provided.
 */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const excerpt =
      args.excerpt ??
      args.content.replace(/<[^>]+>/g, "").slice(0, 180).concat("…");

    const id = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      excerpt,
      authorId: userId,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Post not found");
    if (existing.authorId !== userId) {
      throw new Error("Not authorized to edit this post");
    }

    const { id, ...rest } = args;
    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (rest.title !== undefined) patch.title = rest.title;
    if (rest.content !== undefined) patch.content = rest.content;
    if (rest.excerpt !== undefined) patch.excerpt = rest.excerpt;

    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Post not found");
    if (existing.authorId !== userId) {
      throw new Error("Not authorized to delete this post");
    }

    await ctx.db.delete(args.id);
  },
});

export const list = query(async (ctx) => {
  return await ctx.db.query("posts").order("desc").collect();
});

export const get = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;

    const userId = await auth.getUserId(ctx);
    const canEdit = !!userId && post.authorId === userId;

    return { post, canEdit };
  },
});




