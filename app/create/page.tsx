"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/rich-text-editor";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

export default function CreatePage() {
  const router = useRouter();
  const createPost = useMutation(api.posts.create);
  const me = useQuery(api.users.me) as Doc<"users"> | null | undefined;
  const isAuthenticated = me !== null;
  const isLoading = me === undefined;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError("Please log in to publish.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const id = await createPost({
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
      });
      router.push(`/post/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Write a post</h1>
        <p className="text-muted-foreground">
          Compose with TipTap, save to Convex, and publish instantly.
        </p>
      </div>

      {!isAuthenticated && !isLoading ? (
        <div className="rounded-xl border bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Please <Link className="underline" href="/login">log in</Link> or{" "}
          <Link className="underline" href="/signup">sign up</Link> to write.
        </div>
      ) : null}

      <div className="space-y-4">
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
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        onClick={handleSubmit}
        disabled={saving || !isAuthenticated}
        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving…" : "Publish"}
      </button>
    </div>
  );
}

