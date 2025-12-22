import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";
import { generateSlug } from "./utils";

/**
 * Helper function to ensure slug uniqueness by appending numbers if needed.
 */
async function ensureUniqueSlug(
  ctx: { db: any },
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await ctx.db
      .query("posts")
      .withIndex("slug", (q: any) => q.eq("slug", slug))
      .first();

    if (!existing) {
      return slug;
    }

    // Collision found, append counter
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Post creation. Generates an excerpt automatically if not provided.
 * Also generates a unique slug from the title.
 */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
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

    // Generate slug from title and ensure uniqueness
    const baseSlug = generateSlug(args.title);
    const slug = await ensureUniqueSlug(ctx, baseSlug);

    const id = await ctx.db.insert("posts", {
      title: args.title,
      slug,
      content: args.content,
      excerpt,
      featuredImage: args.featuredImage,
      authorId: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Return the created post to get the slug
    const createdPost = await ctx.db.get(id);
    return createdPost;
  },
});

export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
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

    if (rest.title !== undefined) {
      patch.title = rest.title;
      // Regenerate slug if title changed
      const baseSlug = generateSlug(rest.title);
      // Check if new slug conflicts with other posts (excluding current post)
      const conflictingPost = await ctx.db
        .query("posts")
        .withIndex("slug", (q: any) => q.eq("slug", baseSlug))
        .first();
      
      if (conflictingPost && conflictingPost._id !== id) {
        // Collision with another post, append number
        patch.slug = await ensureUniqueSlug(ctx, baseSlug);
      } else {
        // No collision, use base slug
        patch.slug = baseSlug;
      }
    }
    if (rest.content !== undefined) patch.content = rest.content;
    if (rest.excerpt !== undefined) patch.excerpt = rest.excerpt;
    if (rest.featuredImage !== undefined) patch.featuredImage = rest.featuredImage;

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
  const posts = await ctx.db.query("posts").order("desc").collect();
  // Generate slugs on-the-fly for posts that don't have them (for display purposes)
  // The slug will be saved when the post is accessed via getBySlug
  return posts.map((post) => {
    if (!post.slug) {
      // Generate a temporary slug for display (will be saved when post is accessed)
      const tempSlug = generateSlug(post.title);
      return { ...post, slug: tempSlug };
    }
    return post;
  });
});

/**
 * Search posts by title and content
 * Prioritizes title matches over content matches
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase().trim();
    if (!searchTerm) {
      return [];
    }

    const allPosts = await ctx.db.query("posts").order("desc").collect();
    
    // For single character searches, only search titles to avoid irrelevant results
    const isSingleChar = searchTerm.length === 1;
    
    // Separate posts into title matches and content matches
    const titleMatches: typeof allPosts = [];
    const contentMatches: typeof allPosts = [];
    
    for (const post of allPosts) {
      const titleLower = post.title.toLowerCase();
      const titleMatch = titleLower.includes(searchTerm);
      
      if (titleMatch) {
        titleMatches.push(post);
      } else if (!isSingleChar) {
        // Only search content for multi-character searches
        const contentText = post.content.replace(/<[^>]+>/g, " ").toLowerCase();
        const contentMatch = contentText.includes(searchTerm);
        if (contentMatch) {
          contentMatches.push(post);
        }
      }
    }

    // Combine: title matches first, then content matches
    const matchingPosts = [...titleMatches, ...contentMatches];

    // Generate slugs for posts that don't have them
    return matchingPosts.map((post) => {
      if (!post.slug) {
        const tempSlug = generateSlug(post.title);
        return { ...post, slug: tempSlug };
      }
      return post;
    });
  },
});

/**
 * Get all posts created by the current authenticated user.
 */
export const listByUser = query(async (ctx) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    return [];
  }
  const posts = await ctx.db
    .query("posts")
    .withIndex("authorId", (q: any) => q.eq("authorId", userId))
    .order("desc")
    .collect();
  // Generate slugs on-the-fly for posts that don't have them (for display purposes)
  // The slug will be saved when the post is accessed via getBySlug
  return posts.map((post) => {
    if (!post.slug) {
      // Generate a temporary slug for display (will be saved when post is accessed)
      const tempSlug = generateSlug(post.title);
      return { ...post, slug: tempSlug };
    }
    return post;
  });
});

export const get = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;

    const userId = await auth.getUserId(ctx);
    const canEdit = !!userId && post.authorId === userId;

    // Get author information
    const author = await ctx.db.get(post.authorId);

    return { post, author, canEdit };
  },
});

/**
 * Mutation to ensure a post has a slug saved. Called automatically when needed.
 */
export const ensurePostSlug = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found");
    
    if (!post.slug) {
      const baseSlug = generateSlug(post.title);
      const slug = await ensureUniqueSlug(ctx, baseSlug);
      await ctx.db.patch(args.id, { slug });
      return slug;
    }
    return post.slug;
  },
});

/**
 * Get post by slug for clean URL routing.
 * Handles both posts with saved slugs and legacy posts without slugs.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    console.log(`[getBySlug] Searching for slug: ${args.slug}`);
    
    // First, try to find by saved slug
    let post = await ctx.db
      .query("posts")
      .withIndex("slug", (q: any) => q.eq("slug", args.slug))
      .first();

    console.log(`[getBySlug] Found by index: ${post ? post.title : 'none'}`);

    // If not found by slug, search all posts and find one whose title generates this slug
    if (!post) {
      const allPosts = await ctx.db.query("posts").collect();
      console.log(`[getBySlug] Searching through ${allPosts.length} posts`);
      
      for (const p of allPosts) {
        // Check if post has saved slug that matches
        if (p.slug === args.slug) {
          post = p;
          console.log(`[getBySlug] Found by saved slug: ${p.title}`);
          break;
        }
        // If no saved slug, generate from title and compare
        if (!p.slug) {
          const generatedSlug = generateSlug(p.title);
          console.log(`[getBySlug] Post "${p.title}" generates slug: "${generatedSlug}"`);
          if (generatedSlug === args.slug) {
            post = p;
            console.log(`[getBySlug] Found by generated slug: ${p.title}`);
            break;
          }
        }
      }
    }

    if (!post) {
      console.log(`[getBySlug] ❌ Post not found for slug: ${args.slug}`);
      // Debug: List all posts and their slugs
      const allPosts = await ctx.db.query("posts").collect();
      const postsInfo = allPosts.map(p => ({
        title: p.title,
        slug: p.slug || generateSlug(p.title),
        hasSlug: !!p.slug
      }));
      console.log(`[getBySlug] Available posts:`, postsInfo);
      
      // Last resort: try case-insensitive title match
      const titleMatch = allPosts.find(p => 
        generateSlug(p.title).toLowerCase() === args.slug.toLowerCase()
      );
      if (titleMatch) {
        console.log(`[getBySlug] Found by case-insensitive title match: ${titleMatch.title}`);
        post = titleMatch;
      }
      
      if (!post) {
        return null;
      }
    }

    console.log(`[getBySlug] ✅ Found post: "${post.title}", saved slug: ${post.slug || 'none'}`);

    const userId = await auth.getUserId(ctx);
    const canEdit = !!userId && post.authorId === userId;

    // Get author information
    const author = await ctx.db.get(post.authorId);

    return { post, author, canEdit };
  },
});

/**
 * Migration: Backfill slugs for all existing posts that don't have one.
 * Run this once after deploying the slug feature.
 */
export const migrateSlugs = mutation({
  handler: async (ctx) => {
    const allPosts = await ctx.db.query("posts").collect();
    let migrated = 0;
    
    for (const post of allPosts) {
      if (!post.slug) {
        const baseSlug = generateSlug(post.title);
        const slug = await ensureUniqueSlug(ctx, baseSlug);
        await ctx.db.patch(post._id, { slug });
        migrated++;
      }
    }
    
    return { migrated, total: allPosts.length };
  },
});




