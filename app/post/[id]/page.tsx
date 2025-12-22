"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect } from "react";

/**
 * Backward compatibility: Redirect old ID-based URLs to slug-based URLs.
 * This ensures existing bookmarks and links continue to work.
 */
export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as Id<"posts"> | undefined;

  const result = useQuery(api.posts.get, id ? { id } : "skip");

  // Redirect to slug-based URL when post is loaded
  useEffect(() => {
    if (result?.post?.slug) {
      router.replace(`/posts/${result.post.slug}`);
    }
  }, [result, router]);
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
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-muted-foreground">Redirecting to new URL…</p>
      </div>
    );
  }

  if (result === null) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
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

  // Show loading message while redirecting
  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-muted-foreground">Redirecting to new URL…</p>
    </div>
  );
}




