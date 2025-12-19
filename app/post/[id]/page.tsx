"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useEffect, useState } from "react";
import RichTextEditor from "@/components/rich-text-editor";
import { ProfileAvatar } from "@/components/profile-avatar";
import { format } from "date-fns";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as Id<"posts"> | undefined;

  const result = useQuery(api.posts.get, id ? { id } : "skip");
  const updatePost = useMutation(api.posts.update);
  const deletePost = useMutation(api.posts.remove);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // keep local form state in sync when data loads or changes
  useEffect(() => {
    if (result?.post) {
      setTitle(result.post.title ?? "");
      setExcerpt(result.post.excerpt ?? "");
      setContent(result.post.content ?? "");
      setFeaturedImage(result.post.featuredImage ?? "");
    }
  }, [result]);

  if (!id) return null;

  if (result === undefined) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  if (result === null) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Post not found.</p>
        <button
          onClick={() => router.push("/posts")}
          className="text-primary underline"
        >
          Back to posts
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Medium-like Header Section */}
      <header className="mb-8">
        {!editing && result.post.featuredImage && (
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
          {editing ? (
            <>
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
            </>
          ) : (
            <>
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
                  <ProfileAvatar user={result.author} size="md" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {result.author.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(result.post.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {/* Edit/Delete Actions */}
      {result.canEdit && (
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center gap-3">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  // reset changes
                  if (result?.post) {
                    setTitle(result.post.title ?? "");
                    setExcerpt(result.post.excerpt ?? "");
                    setContent(result.post.content ?? "");
                    setFeaturedImage(result.post.featuredImage ?? "");
                  }
                }}
                className="rounded-full border px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={async () => {
                  if (!title.trim() || !content.trim()) {
                    setError("Title and content are required.");
                    return;
                  }
                  setSaving(true);
                  setError(null);
                  try {
                    await updatePost({
                      id,
                      title: title.trim(),
                      excerpt: excerpt.trim() || undefined,
                      content,
                      featuredImage: featuredImage.trim() || undefined,
                    });
                    setEditing(false);
                  } catch (err) {
                    console.error(err);
                    setError("Failed to save changes.");
                  } finally {
                    setSaving(false);
                  }
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60 hover:bg-slate-800 transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(true)}
                className="rounded-full border px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
              >
                Edit
              </button>
              <button
                disabled={deleting}
                onClick={async () => {
                  const confirmed = window.confirm(
                    "Delete this post? This cannot be undone."
                  );
                  if (!confirmed) return;
                  setDeleting(true);
                  try {
                    await deletePost({ id });
                    router.push("/posts");
                  } catch (err) {
                    console.error(err);
                    setError("Failed to delete post.");
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60 hover:bg-red-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
        {editing ? (
          <RichTextEditor content={content} onChange={setContent} />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: result.post.content }}
          />
        )}
      </div>

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




