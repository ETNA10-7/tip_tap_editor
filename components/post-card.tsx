"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useTheme } from "@/contexts/theme-context";

type Author = {
  _id: Id<"users">;
  name: string;
  image?: string | null;
  username?: string | null;
} | null;

type Post = {
  _id: Id<"posts">;
  title: string;
  slug?: string; // Optional for backward compatibility
  excerpt?: string;
  featuredImage?: string;
  createdAt: number;
  published?: boolean; // Draft/published status
  author?: Author; // Author information
};

/**
 * Generate a slug from title if slug is missing (fallback for legacy posts)
 */
function getPostSlug(post: Post): string {
  if (post.slug) {
    return post.slug;
  }
  // Fallback: generate slug from title (client-side)
  return post.title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "post";
}

/**
 * Generate a username slug from author info for profile links.
 * Uses stored username if available, otherwise generates from name.
 */
function getAuthorUsername(author: Author): string {
  if (!author) return "anonymous";
  
  // Use stored username if available
  if (author.username) {
    return author.username;
  }
  
  // Generate from name if available
  if (author.name) {
    const username = author.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    return username || "user";
  }
  
  // Fallback: use a portion of the user ID (convert to string first)
  const userIdStr = String(author._id);
  return userIdStr.slice(-8); // Use last 8 characters as fallback
}

export function PostCard({ post, isHomepage = false }: { post: Post; isHomepage?: boolean }) {
  const slug = getPostSlug(post);
  const { theme } = useTheme();
  const isLightMode = theme === "light" && !isHomepage;
  const useLightStyling = isHomepage || isLightMode;
  
  return (
    <article className={`group rounded-xl border overflow-hidden shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 ${
      useLightStyling
        ? "border-gray-200 bg-white"
        : "border-slate-700 bg-slate-800/50 backdrop-blur-sm"
    }`}>
      {post.featuredImage && (
        <Link href={`/posts/${slug}`} className="block">
          <div className={`relative w-full h-48 overflow-hidden ${
            useLightStyling ? "bg-gray-100" : "bg-slate-100"
          }`}>
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </Link>
      )}
      <div className="p-5">
        {/* Author Info */}
        {post.author && (
          <Link
            href={`/users/${getAuthorUsername(post.author)}`}
            className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
          >
            <ProfileAvatar user={post.author} size="sm" />
            <span className={`text-sm font-medium ${
              useLightStyling ? "!text-black" : "text-slate-300"
            }`}>
              {post.author.name}
            </span>
          </Link>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <div className={`text-xs uppercase tracking-wide ${
            useLightStyling ? "!text-black" : "text-muted-foreground"
          }`}>
            {format(new Date(post.createdAt), "PP")}
          </div>
          {post.published === false && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Draft
            </span>
          )}
        </div>
        <Link
          href={`/posts/${slug}`}
          className={`block text-xl font-bold leading-tight transition-colors ${
            useLightStyling
              ? "!text-black hover:text-gray-700" 
              : "text-white hover:text-slate-200"
          }`}
        >
          {post.title}
        </Link>
        {post.excerpt ? (
          <p className={`mt-2 text-sm line-clamp-3 leading-relaxed ${
            useLightStyling ? "!text-black" : "text-slate-300"
          }`}>
            {post.excerpt}
          </p>
        ) : null}
        <Link
          href={`/posts/${slug}`}
          className={`mt-4 inline-flex items-center text-sm font-medium hover:underline transition-colors ${
            useLightStyling
              ? "text-blue-700 hover:text-blue-800"
              : "text-teal-400 hover:text-teal-300"
          }`}
        >
          Read story →
        </Link>
      </div>
    </article>
  );
}




