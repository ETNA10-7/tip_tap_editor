import Link from "next/link";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

type Post = {
  _id: Id<"posts">;
  title: string;
  slug?: string; // Optional for backward compatibility
  excerpt?: string;
  featuredImage?: string;
  createdAt: number;
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

export function PostCard({ post }: { post: Post }) {
  const slug = getPostSlug(post);
  
  return (
    <article className="group rounded-xl border bg-white overflow-hidden shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
      {post.featuredImage && (
        <Link href={`/posts/${slug}`} className="block">
          <div className="relative w-full h-48 overflow-hidden bg-slate-100">
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
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          {format(new Date(post.createdAt), "PP")}
        </div>
        <Link
          href={`/posts/${slug}`}
          className="block text-xl font-bold leading-tight text-slate-900 hover:text-slate-700 transition-colors"
        >
          {post.title}
        </Link>
        {post.excerpt ? (
          <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        ) : null}
        <Link
          href={`/posts/${slug}`}
          className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          Read story →
        </Link>
      </div>
    </article>
  );
}




