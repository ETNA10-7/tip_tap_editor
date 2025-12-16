import Link from "next/link";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

type Post = {
  _id: Id<"posts">;
  title: string;
  excerpt?: string;
  createdAt: number;
};

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {format(new Date(post.createdAt), "PP")}
      </div>
      <Link
        href={`/post/${post._id}`}
        className="mt-2 block text-lg font-semibold leading-tight"
      >
        {post.title}
      </Link>
      {post.excerpt ? (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>
      ) : null}
      <Link
        href={`/post/${post._id}`}
        className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
      >
        Read story →
      </Link>
    </article>
  );
}




