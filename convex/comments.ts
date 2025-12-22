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
 * Clap (like) a comment
 */
export const clap = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    await ctx.db.patch(args.id, {
      claps: comment.claps + 1,
    });

    return comment.claps + 1;
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

    // Build comment tree with author info
    const buildCommentWithReplies = async (comment: typeof allComments[0]) => {
      const author = await ctx.db.get(comment.authorId);
      const replies = repliesMap.get(comment._id) || [];
      
      const repliesWithAuthors = await Promise.all(
        replies.map(async (reply) => {
          const replyAuthor = await ctx.db.get(reply.authorId);
          return {
            ...reply,
            author: replyAuthor
              ? {
                  _id: replyAuthor._id,
                  name: replyAuthor.name || "Anonymous",
                  image: replyAuthor.image,
                }
              : null,
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

