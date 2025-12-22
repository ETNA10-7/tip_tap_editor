import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";

/**
 * Create a new comment on a post
 */
export const create = mutation({
  args: {
    postId: v.id("posts"),
    parentId: v.optional(v.id("comments")), // For replies to other comments
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!args.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    // Verify post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const now = Date.now();
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: userId,
      parentId: args.parentId,
      content: args.content.trim(),
      claps: 0,
      createdAt: now,
      updatedAt: now,
    });

    return commentId;
  },
});

/**
 * Update a comment (only by author)
 */
export const update = mutation({
  args: {
    id: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== userId) {
      throw new Error("Not authorized to edit this comment");
    }

    if (!args.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      content: args.content.trim(),
      updatedAt: now,
      editedAt: now,
    });

    return args.id;
  },
});

/**
 * Delete a comment (only by author)
 */
export const remove = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== userId) {
      throw new Error("Not authorized to delete this comment");
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Toggle clap (like/unlike) a comment
 * Returns the new clap count and whether the user has clapped
 */
export const toggleClap = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user already clapped
    const existingClap = await ctx.db
      .query("commentClaps")
      .withIndex("commentId_userId", (q: any) =>
        q.eq("commentId", args.id).eq("userId", userId)
      )
      .first();

    if (existingClap) {
      // User already clapped - remove the clap (unlike)
      await ctx.db.delete(existingClap._id);
      const newClapCount = Math.max(0, comment.claps - 1);
      await ctx.db.patch(args.id, {
        claps: newClapCount,
      });
      return { claps: newClapCount, hasClapped: false };
    } else {
      // User hasn't clapped - add the clap (like)
      await ctx.db.insert("commentClaps", {
        commentId: args.id,
        userId,
        createdAt: Date.now(),
      });
      const newClapCount = comment.claps + 1;
      await ctx.db.patch(args.id, {
        claps: newClapCount,
      });
      return { claps: newClapCount, hasClapped: true };
    }
  },
});

/**
 * Check if current user has clapped a comment
 */
export const hasClapped = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return false;
    }

    const clap = await ctx.db
      .query("commentClaps")
      .withIndex("commentId_userId", (q: any) =>
        q.eq("commentId", args.commentId).eq("userId", userId)
      )
      .first();

    return !!clap;
  },
});

/**
 * Get all comments for a post (with author info)
 */
export const listByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    // Get all comments for this post
    const allComments = await ctx.db
      .query("comments")
      .withIndex("postId", (q: any) => q.eq("postId", args.postId))
      .collect();

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter((c) => c.parentId === undefined);
    const repliesMap = new Map<string, typeof allComments>();
    
    // Group replies by parent ID
    allComments.forEach((comment) => {
      if (comment.parentId) {
        const parentId = comment.parentId;
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId)!.push(comment);
      }
    });

    // Get current user ID for clap checking
    const userId = await auth.getUserId(ctx);

    // Build comment tree with author info and clap status
    const buildCommentWithReplies = async (comment: typeof allComments[0]) => {
      const author = await ctx.db.get(comment.authorId);
      const replies = repliesMap.get(comment._id) || [];
      
      // Check if current user has clapped this comment
      let hasClapped = false;
      if (userId) {
        const clap = await ctx.db
          .query("commentClaps")
          .withIndex("commentId_userId", (q: any) =>
            q.eq("commentId", comment._id).eq("userId", userId)
          )
          .first();
        hasClapped = !!clap;
      }
      
      const repliesWithAuthors = await Promise.all(
        replies.map(async (reply) => {
          const replyAuthor = await ctx.db.get(reply.authorId);
          
          // Check if current user has clapped this reply
          let replyHasClapped = false;
          if (userId) {
            const replyClap = await ctx.db
              .query("commentClaps")
              .withIndex("commentId_userId", (q: any) =>
                q.eq("commentId", reply._id).eq("userId", userId)
              )
              .first();
            replyHasClapped = !!replyClap;
          }
          
          return {
            ...reply,
            author: replyAuthor
              ? {
                  _id: replyAuthor._id,
                  name: replyAuthor.name || "Anonymous",
                  image: replyAuthor.image,
                }
              : null,
            hasClapped: replyHasClapped,
            replies: [], // Replies don't have nested replies for now
          };
        })
      );

      return {
        ...comment,
        author: author
          ? {
              _id: author._id,
              name: author.name || "Anonymous",
              image: author.image,
            }
          : null,
        hasClapped,
        replies: repliesWithAuthors,
      };
    };

    // Build all top-level comments with their replies
    const commentsWithAuthors = await Promise.all(
      topLevelComments.map((comment) => buildCommentWithReplies(comment))
    );

    // Sort by creation date (newest first)
    return commentsWithAuthors.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get comment count for a post
 */
export const countByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("postId", (q: any) => q.eq("postId", args.postId))
      .collect();

    return comments.length;
  },
});

