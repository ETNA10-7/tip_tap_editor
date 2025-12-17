"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/hooks/useAuth";

export default function PostsPage() {
  const { user, isAuthenticated } = useAuth();
  
  // Show user's posts if logged in, otherwise show all posts
  const userPosts = useQuery(
    api.posts.listByUser,
    isAuthenticated ? {} : "skip"
  );
  const allPosts = useQuery(
    api.posts.list,
    !isAuthenticated ? {} : "skip"
  );
  
  const posts = isAuthenticated ? (userPosts ?? []) : (allPosts ?? []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">
          {isAuthenticated ? "My posts" : "All posts"}
        </h1>
        <p className="text-muted-foreground">
          {isAuthenticated
            ? "Posts you've created, saved in Convex."
            : "Stories saved in Convex, rendered with the TipTap editor."}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          {isAuthenticated
            ? "You haven't created any posts yet. Start writing!"
            : "No posts yet."}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}




