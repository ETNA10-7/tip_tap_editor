"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import RichTextEditor from "@/components/rich-text-editor";
import { ProfileAvatar } from "@/components/profile-avatar";
import { format } from "date-fns";

export default function PostEditPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const result = useQuery(api.posts.getBySlug, slug ? { slug } : "skip");
  const updatePost = useMutation(api.posts.update);
  const deletePost = useMutation(api.posts.remove);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep local form state in sync when data loads or changes
  useEffect(() => {
    if (result?.post) {
      setTitle(result.post.title ?? "");
      setExcerpt(result.post.excerpt ?? "");
      setContent(result.post.content ?? "");
      setFeaturedImage(result.post.featuredImage ?? "");
    }
  }, [result]);

  if (!slug) return null;

  if (result === undefined) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (result === null) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <p className="text-muted-foreground">Post not found.</p>
        <Link
          href="/posts"
          className="text-primary underline"
        >
          Back to posts
        </Link>
      </div>
    );
  }

  if (!result.canEdit) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <p className="text-muted-foreground">
          You don't have permission to edit this post.
        </p>
        <Link
          href={`/posts/${slug}`}
          className="text-primary underline"
        >
          View post
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePost({
        id: result.post._id,
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content,
        featuredImage: featuredImage.trim() || undefined,
      });
      // Redirect to the new slug (in case title changed and slug was regenerated)
      router.push(`/posts/${updated.slug}`);
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this post? This cannot be undone."
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deletePost({ id: result.post._id });
      router.push("/posts");
    } catch (err) {
      console.error(err);
      setError("Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header Section */}
      <header className="mb-8">
        <div className="space-y-4">
          <input
            className="w-full rounded-lg border px-3 py-2 text-3xl font-semibold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
          />
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-base"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Optional excerpt"
            rows={2}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Featured Image URL
            </label>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Preview"
                className="max-w-full h-auto rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
        </div>
      </header>

      {/* Actions */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60 hover:bg-slate-800 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <Link
          href={`/posts/${slug}`}
          className="rounded-full border px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          disabled={deleting}
          onClick={handleDelete}
          className="rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60 hover:bg-red-50 transition-colors"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

      {/* Content Editor */}
      <RichTextEditor content={content} onChange={setContent} />

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <Link 
          href={`/posts/${slug}`}
          className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to post
        </Link>
      </div>
    </article>
  );
}





