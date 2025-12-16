"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useEffect, useState } from "react";
import RichTextEditor from "@/components/rich-text-editor";

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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // keep local form state in sync when data loads or changes
  useEffect(() => {
    if (result?.post) {
      setTitle(result.post.title ?? "");
      setExcerpt(result.post.excerpt ?? "");
      setContent(result.post.content ?? "");
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
    <article className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Published {new Date(result.post.createdAt).toLocaleDateString()}
          </p>
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
            </>
          ) : (
            <>
              <h1 className="text-4xl font-semibold leading-tight">
                {result.post.title}
              </h1>
              {result.post.excerpt ? (
                <p className="text-lg text-muted-foreground">
                  {result.post.excerpt}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {result.canEdit ? (
            editing ? (
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
                    }
                  }}
                  className="rounded-full border px-4 py-2 text-sm"
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
                      });
                      setEditing(false);
                    } catch (err) {
                      console.error(err);
                      setError("Failed to save changes.");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-full border px-4 py-2 text-sm"
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
                  className="rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            )
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {editing ? (
        <RichTextEditor content={content} onChange={setContent} />
      ) : (
        <div
          className="prose prose-slate max-w-none prose-headings:scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: result.post.content }}
        />
      )}

      {!result.canEdit ? (
        <p className="text-sm text-muted-foreground">
          Sign in as the author to edit this post.
        </p>
      ) : null}

      <div className="pt-6">
        <Link href="/posts" className="text-primary underline">
          ← Back to posts
        </Link>
      </div>
    </article>
  );
}




