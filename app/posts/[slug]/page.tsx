"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profile-avatar";
import { PostComments } from "@/components/post-comments";
import { format } from "date-fns";
import { useEffect, useMemo } from "react";

/**
 * Calculate reading time from HTML content
 * Average reading speed: 200 words per minute
 */
function calculateReadingTime(htmlContent: string): number {
  // Strip HTML tags and get text content
  const text = htmlContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // Count words (split by spaces)
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  // Calculate minutes (200 words per minute)
  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, minutes); // At least 1 minute
}

/**
 * Generate a username slug from author info for profile links.
 * Uses stored username if available, otherwise generates from name.
 */
function getAuthorUsername(author: { name?: string | null; username?: string | null; _id: string } | null): string {
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
  
  // Fallback: use a portion of the user ID
  const userIdStr = String(author._id);
  return userIdStr.slice(-8);
}

export default function PostDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const result = useQuery(api.posts.getBySlug, slug ? { slug } : "skip");
  const ensureSlug = useMutation(api.posts.ensurePostSlug);

  // Calculate reading time
  const readingTime = useMemo(() => {
    if (!result?.post?.content) return null;
    return calculateReadingTime(result.post.content);
  }, [result?.post?.content]);

  // Debug logging
  useEffect(() => {
    console.log("[PostDetailPage] Slug:", slug);
    console.log("[PostDetailPage] Query result:", result);
    if (result?.post) {
      console.log("[PostDetailPage] Post found:", result.post.title);
    }
  }, [slug, result]);

  // Save slug to database if post exists but doesn't have slug saved
  useEffect(() => {
    if (result?.post && !result.post.slug) {
      console.log("[PostDetailPage] Saving slug for post:", result.post._id);
      ensureSlug({ id: result.post._id }).catch(console.error);
    }
  }, [result, ensureSlug]);

  if (!slug) {
    console.log("[PostDetailPage] No slug provided");
    return null;
  }

  if (result === undefined) {
    console.log("[PostDetailPage] Loading...");
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (result === null) {
    console.log("[PostDetailPage] Post not found for slug:", slug);
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <p className="text-muted-foreground">Post not found for slug: {slug}</p>
        <p className="text-sm text-muted-foreground">
          Check the Convex dev server logs for debugging information.
        </p>
        <Link
          href="/posts"
          className="text-primary underline"
        >
          Back to posts
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Medium-like Header Section */}
      <header className="mb-8">
        {result.post.featuredImage && (
          <div className="mb-8 -mx-4 sm:-mx-8 md:-mx-12 lg:-mx-16">
            <img
              src={result.post.featuredImage}
              alt={result.post.title}
              className="w-full h-[400px] object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900">
            {result.post.title}
          </h1>
          {result.post.excerpt && (
            <p className="text-xl text-slate-600 leading-relaxed">
              {result.post.excerpt}
            </p>
          )}
          
          {/* Author Info */}
          {result.author && (
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <Link
                href={`/users/${getAuthorUsername(result.author)}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <ProfileAvatar user={result.author} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {result.author.name || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{format(new Date(result.post.createdAt), "MMM d, yyyy")}</span>
                    {readingTime && (
                      <>
                        <span>•</span>
                        <span>{readingTime} min read</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Edit/Delete Actions */}
          {result.canEdit && (
            <div className="flex items-center gap-3 pt-4">
              <Link
                href={`/posts/${slug}/edit`}
                className="rounded-full border px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
              >
                Edit
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Medium-like Content Section */}
      <div className="prose prose-lg prose-slate max-w-none 
        prose-headings:font-bold prose-headings:text-slate-900
        prose-p:text-slate-700 prose-p:leading-relaxed
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-slate-900
        prose-img:rounded-lg prose-img:my-8 prose-img:shadow-lg
        prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4
        prose-code:text-sm prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded
        prose-pre:bg-slate-900 prose-pre:text-slate-100">
        <div
          dangerouslySetInnerHTML={{ __html: result.post.content }}
        />
      </div>

      {/* Comments Section */}
      <PostComments postId={result.post._id} />

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <Link 
          href="/posts" 
          className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to posts
        </Link>
      </div>
    </article>
  );
}


