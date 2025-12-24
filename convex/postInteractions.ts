import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";

/**
 * Toggle clap (like/unlike) a post
 * Returns the new clap count and whether the user has clapped
 */
export const toggleClap = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user already clapped
    const existingClap = await ctx.db
      .query("postClaps")
      .withIndex("postId_userId", (q: any) => q.eq("postId", args.postId).eq("userId", userId))
      .first();

    const currentClaps = post.claps ?? 0;
    
    if (existingClap) {
      // User already clapped - remove the clap (unlike)
      await ctx.db.delete(existingClap._id);
      const newClapCount = Math.max(0, currentClaps - 1);
      await ctx.db.patch(args.postId, {
        claps: newClapCount,
      });
      return { claps: newClapCount, hasClapped: false };
    } else {
      // User hasn't clapped - add the clap (like)
      await ctx.db.insert("postClaps", {
        postId: args.postId,
        userId,
        createdAt: Date.now(),
      });
      const newClapCount = currentClaps + 1;
      await ctx.db.patch(args.postId, {
        claps: newClapCount,
      });
      return { claps: newClapCount, hasClapped: true };
    }
  },
});

/**
 * Check if current user has clapped a post
 */
export const hasClapped = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return false;
    }

    const clap = await ctx.db
      .query("postClaps")
      .withIndex("postId_userId", (q: any) => q.eq("postId", args.postId).eq("userId", userId))
      .first();

    return !!clap;
  },
});

/**
 * Toggle bookmark (save/unsave) a post
 * Returns whether the post is now bookmarked
 */
export const toggleBookmark = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user already bookmarked
    const existingBookmark = await ctx.db
      .query("bookmarks")
      .withIndex("postId_userId", (q: any) => q.eq("postId", args.postId).eq("userId", userId))
      .first();

    if (existingBookmark) {
      // User already bookmarked - remove the bookmark
      await ctx.db.delete(existingBookmark._id);
      return { bookmarked: false };
    } else {
      // User hasn't bookmarked - add the bookmark
      await ctx.db.insert("bookmarks", {
        postId: args.postId,
        userId,
        createdAt: Date.now(),
      });
      return { bookmarked: true };
    }
  },
});

/**
 * Check if current user has bookmarked a post
 */
export const hasBookmarked = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return false;
    }

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("postId_userId", (q: any) => q.eq("postId", args.postId).eq("userId", userId))
      .first();

    return !!bookmark;
  },
});

/**
 * Get comment count for a post
 */
export const getCommentCount = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("postId", (q: any) => q.eq("postId", args.postId))
      .collect();
    
    return comments.length;
  },
});

