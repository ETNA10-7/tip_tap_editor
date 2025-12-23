// convex/schema.ts
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Core Convex data model.
 *
 * Legacy `note` table is kept for backward compatibility.
 * `posts` now carries author ownership for auth-aware mutations.
 * 
 * Users table is extended from authTables to include profile fields:
 * - image: Profile picture URL
 * - bio: User biography/description
 */
export default defineSchema({
  ...authTables,
  // Extend users table with profile fields
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()), // Profile picture URL
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    bio: v.optional(v.string()), // User biography/description
    username: v.optional(v.string()), // URL-friendly username for public profiles
  })
    .index("email", ["email"])
    .index("username", ["username"]), // Index for fast username lookups
  note: defineTable({
    title: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }),
  posts: defineTable({
    title: v.string(),
    slug: v.optional(v.string()), // URL-friendly slug for SEO (temporarily optional for migration)
    content: v.string(), // serialized HTML from TipTap
    excerpt: v.optional(v.string()),
    featuredImage: v.optional(v.string()), // Featured image URL for Medium-like display
    authorId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("authorId", ["authorId"])
    .index("slug", ["slug"]), // Index for fast slug lookups
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("comments")), // For nested replies
    content: v.string(), // Comment text content
    claps: v.number(), // Number of claps/likes (denormalized for performance)
    createdAt: v.number(),
    updatedAt: v.number(),
    editedAt: v.optional(v.number()), // Track if comment was edited
  })
    .index("postId", ["postId"])
    .index("parentId", ["parentId"]), // Index for nested replies
  commentClaps: defineTable({
    commentId: v.id("comments"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("commentId", ["commentId"])
    .index("userId", ["userId"])
    .index("commentId_userId", ["commentId", "userId"]), // Unique constraint for one clap per user per comment
});