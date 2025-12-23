"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import RichTextEditor from "@/components/rich-text-editor";
import { ImageInstructions } from "@/components/image-instructions";
import Link from "next/link";

export default function CreatePage() {
  const router = useRouter();
  const createPost = useMutation(api.posts.create);
  const { user, isAuthenticated, isLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [published, setPublished] = useState(true); // Default to published
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Route to auth page ONLY after auth state has fully resolved
  // CRITICAL: Only route if:
  // 1. Auth loading is complete (isLoading === false)
  // 2. User is not authenticated (user === null)
  // Do NOT route while isLoading is true
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("[CreatePage] ❌ User not authenticated - routing to /auth");
      router.push("/auth?redirect=/create");
    } else if (!isLoading && user) {
      console.log("[CreatePage] ✅ User authenticated and exists:");
      console.log("[CreatePage] User info:", {
        email: user.email,
        name: user.name,
        _id: user._id,
      });
      console.log("[CreatePage] User can write posts");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async () => {
    // Double-check authentication before submitting
    if (!isAuthenticated || !user) {
      router.push("/auth?redirect=/create");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const createdPost = await createPost({
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        featuredImage: featuredImage.trim() || undefined,
        published,
      });
      // Redirect to slug-based URL
      if (createdPost?.slug) {
        router.push(`/posts/${createdPost.slug}`);
      } else {
        // Fallback: try to construct slug from title (shouldn't happen, but safety check)
        const fallbackSlug = title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        router.push(`/posts/${fallbackSlug}`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // CRITICAL: Show loading state while auth is loading
  // Do NOT check authentication or redirect until isLoading is false
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Write a post</h1>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Only check authentication AFTER loading is complete
  // CRITICAL: Only redirect if user is null (not authenticated)
  // Do NOT redirect if user exists (authenticated)
  // The useEffect handles the redirect, but show message if redirect is delayed
  if (!isAuthenticated || !user) {
    // Show message while redirect is happening (useEffect will redirect)
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Write a post</h1>
          <p className="text-muted-foreground">
            Please sign in to write a post.
          </p>
        </div>
        <div className="rounded-xl border bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You need to be signed in to write a post.{" "}
          <Link href="/auth?redirect=/create" className="font-semibold underline">
            Sign in or sign up
          </Link>{" "}
          to continue.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Write a post</h1>
        <p className="text-muted-foreground">
          Compose with TipTap, save to Convex, and publish instantly.
        </p>
      </div>

      <div className="space-y-4">
        <ImageInstructions />
        
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A headline-worthy title"
          className="w-full rounded-lg border px-3 py-2 text-lg"
        />
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Optional: a short teaser for your post"
          className="w-full rounded-lg border px-3 py-2"
          rows={3}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Featured Image URL (Optional)
          </label>
          <input
            type="url"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Add a featured image that will appear at the top of your post
          </p>
          {featuredImage && (
            <div className="mt-2">
              <img
                src={featuredImage}
                alt="Featured image preview"
                className="max-w-full h-auto rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="publish-toggle"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <label htmlFor="publish-toggle" className="text-sm font-medium text-slate-700 cursor-pointer">
            {published ? "Publish" : "Save as Draft"}
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving || !isAuthenticated}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : published ? "Publish" : "Save Draft"}
        </button>
      </div>
    </div>
  );
}

