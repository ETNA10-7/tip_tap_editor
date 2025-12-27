"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profile-avatar";
import { PostComments } from "@/components/post-comments";
import { format } from "date-fns";
import { useEffect, useMemo, useState, useRef } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/theme-context";


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
  const { user } = useAuth();
  const { theme } = useTheme();
  const commentsRef = useRef<HTMLDivElement>(null);
  const isLightMode = theme === "light";

  const result = useQuery(api.posts.getBySlug, slug ? { slug } : "skip");
  const ensureSlug = useMutation(api.posts.ensurePostSlug);
  
  // Post interactions
  const postId = result?.post?._id;
  const hasClapped = useQuery(
    api.postInteractions.hasClapped,
    postId ? { postId } : "skip"
  );
  const hasBookmarked = useQuery(
    api.postInteractions.hasBookmarked,
    postId ? { postId } : "skip"
  );
  const commentCount = useQuery(
    api.postInteractions.getCommentCount,
    postId ? { postId } : "skip"
  );
  const toggleClap = useMutation(api.postInteractions.toggleClap);
  const toggleBookmark = useMutation(api.postInteractions.toggleBookmark);
  
  const [isClapping, setIsClapping] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

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
      <>
        {isLightMode && (
          <div 
            className="fixed inset-0 -z-10"
            style={{ backgroundColor: 'var(--leafy-green, #B8DB80)' }}
          />
        )}
        <div className="max-w-4xl mx-auto relative z-0">
          <p className={isLightMode ? "text-black" : "text-muted-foreground"}>Loading…</p>
        </div>
      </>
    );
  }

  if (result === null) {
    console.log("[PostDetailPage] Post not found for slug:", slug);
    return (
      <>
        {isLightMode && (
          <div 
            className="fixed inset-0 -z-10"
            style={{ backgroundColor: 'var(--leafy-green, #B8DB80)' }}
          />
        )}
        <div className="max-w-4xl mx-auto space-y-4 relative z-0">
          <p className={isLightMode ? "text-black" : "text-muted-foreground"}>Post not found for slug: {slug}</p>
          <p className={`text-sm ${isLightMode ? "text-black" : "text-muted-foreground"}`}>
            Check the Convex dev server logs for debugging information.
          </p>
          <Link
            href="/posts"
            className={`${isLightMode ? "text-blue-700 hover:text-blue-800" : "text-primary"} underline`}
          >
            Back to posts
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Green background overlay for light mode only */}
      {isLightMode && (
        <div 
          className="fixed inset-0 -z-10"
          style={{ backgroundColor: 'var(--leafy-green, #B8DB80)' }}
        />
      )}
      <article className="max-w-4xl mx-auto relative z-0">
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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className={`text-5xl font-bold leading-tight tracking-tight ${isLightMode ? "text-black" : "text-white"}`}>
              {result.post.title}
            </h1>
            {result.post.published === false && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Draft
              </span>
            )}
          </div>
          {result.post.excerpt && (
            <p className={`text-xl leading-relaxed ${isLightMode ? "text-black" : "text-slate-200"}`}>
              {result.post.excerpt}
            </p>
          )}
          
          {/* Author Info */}
          {result.author && (
            <div className={`flex items-center gap-3 pt-4 border-t ${isLightMode ? "border-gray-300" : "border-slate-200"}`}>
              <Link
                href={`/users/${getAuthorUsername(result.author)}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <ProfileAvatar user={result.author} size="md" />
                <div className="flex-1">
                  <p className={`font-semibold ${isLightMode ? "text-black" : "text-white"}`}>
                    {result.author.name || "Anonymous"}
                  </p>
                  <div className={`flex items-center gap-2 text-sm ${isLightMode ? "text-black" : "text-slate-300"}`}>
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

          {/* Interaction Bar - Medium-like */}
          <div className={`flex items-center justify-between pt-4 border-t ${isLightMode ? "border-gray-300" : "border-slate-700"}`}>
            <div className="flex items-center gap-6">
              {/* Clap/Heart Button */}
              <button
                onClick={async () => {
                  if (!user || !postId || isClapping) return;
                  setIsClapping(true);
                  try {
                    await toggleClap({ postId });
                  } catch (error) {
                    console.error("Failed to toggle clap:", error);
                  } finally {
                    setIsClapping(false);
                  }
                }}
                disabled={!user || isClapping}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 ${
                  hasClapped
                    ? "bg-red-500/20 border-red-500/50 text-red-600 hover:bg-red-500/30"
                    : isLightMode
                      ? "border-gray-300 bg-white text-black hover:bg-gray-50 hover:border-gray-400"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500"
                } ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Heart className={`h-5 w-5 ${hasClapped ? "fill-red-400 text-red-400" : ""}`} />
                <span className="text-sm font-medium">
                  {result.post.claps || 0}
                </span>
              </button>

              {/* Comments Count - Clickable */}
              <button
                onClick={() => {
                  commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 cursor-pointer ${
                  isLightMode
                    ? "border-gray-300 bg-white text-black hover:bg-gray-50 hover:border-gray-400"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {commentCount ?? 0}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Bookmark Button */}
              <button
                onClick={async () => {
                  if (!user || !postId || isBookmarking) return;
                  setIsBookmarking(true);
                  try {
                    await toggleBookmark({ postId });
                  } catch (error) {
                    console.error("Failed to toggle bookmark:", error);
                  } finally {
                    setIsBookmarking(false);
                  }
                }}
                disabled={!user || isBookmarking}
                className={`p-2.5 rounded-full border transition-all duration-200 ${
                  hasBookmarked
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/30"
                    : isLightMode
                      ? "border-gray-300 bg-white text-black hover:bg-gray-50 hover:border-gray-400"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500"
                } ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                title={hasBookmarked ? "Remove bookmark" : "Save for later"}
              >
                <Bookmark className={`h-5 w-5 ${hasBookmarked ? "fill-yellow-400 text-yellow-400" : ""}`} />
              </button>

              {/* Share Button */}
              <button
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: result.post.title,
                        text: result.post.excerpt || result.post.title,
                        url,
                      });
                    } catch (error) {
                      // User cancelled or error occurred
                      console.log("Share cancelled or failed");
                    }
                  } else {
                    // Fallback: copy to clipboard
                    try {
                      await navigator.clipboard.writeText(url);
                      alert("Link copied to clipboard!");
                    } catch (error) {
                      console.error("Failed to copy:", error);
                    }
                  }
                }}
                className={`p-2.5 rounded-full border transition-all duration-200 cursor-pointer ${
                  isLightMode
                    ? "border-gray-300 bg-white text-black hover:bg-gray-50 hover:border-gray-400"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500"
                }`}
                title="Share post"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

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
        prose-headings:font-bold prose-headings:text-white
        prose-p:text-slate-200 prose-p:leading-relaxed
        prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-img:rounded-lg prose-img:my-8 prose-img:shadow-lg
        prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4
        prose-code:text-sm prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded
        prose-pre:bg-slate-900 prose-pre:text-slate-100">
        <div
          dangerouslySetInnerHTML={{ __html: result.post.content }}
        />
      </div>

      {/* Comments Section */}
      <div ref={commentsRef} id="comments-section">
        <PostComments postId={result.post._id} />
      </div>

      {/* Footer Navigation */}
      <div className={`mt-12 pt-8 border-t ${isLightMode ? "border-gray-300" : "border-slate-200"}`}>
        <Link 
          href="/posts" 
          className={`inline-flex items-center transition-colors ${
            isLightMode
              ? "text-blue-700 hover:text-blue-800"
              : "text-slate-300 hover:text-white"
          }`}
        >
          ← Back to posts
        </Link>
      </div>
    </article>
    </>
  );
}


