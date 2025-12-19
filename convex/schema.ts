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
  })
    .index("email", ["email"]),
  note: defineTable({
    title: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }),
  posts: defineTable({
    title: v.string(),
    content: v.string(), // serialized HTML from TipTap
    excerpt: v.optional(v.string()),
    featuredImage: v.optional(v.string()), // Featured image URL for Medium-like display
    authorId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("authorId", ["authorId"]),
});