// convex/schema.ts
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Core Convex data model.
 *
 * Legacy `note` table is kept for backward compatibility.
 * `posts` now carries author ownership for auth-aware mutations.
 */
export default defineSchema({
  ...authTables,
  note: defineTable({
    title: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }),
  posts: defineTable({
    title: v.string(),
    content: v.string(), // serialized HTML from TipTap
    excerpt: v.optional(v.string()),
    authorId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("authorId", ["authorId"]),
});