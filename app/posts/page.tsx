"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";

export default function PostsPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // Use search query if search term exists, otherwise show user's posts or all posts
  const searchResults = useQuery(
    api.posts.search,
    searchQuery ? { query: searchQuery } : "skip"
  );
  
  const userPosts = useQuery(
    api.posts.listByUser,
    isAuthenticated && !searchQuery ? {} : "skip"
  );
  const allPosts = useQuery(
    api.posts.list,
    !isAuthenticated && !searchQuery ? {} : "skip"
  );
  
  // Determine which posts to display
  const posts = searchQuery 
    ? (searchResults ?? [])
    : isAuthenticated 
      ? (userPosts ?? []) 
      : (allPosts ?? []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">
          {searchQuery 
            ? `Search results for "${searchQuery}"` 
            : isAuthenticated 
              ? "My posts" 
              : "All posts"}
        </h1>
        <p className="text-muted-foreground">
          {searchQuery
            ? `Found ${posts.length} ${posts.length === 1 ? "post" : "posts"}`
            : isAuthenticated
              ? "Posts you've created, saved in Convex."
              : "Stories saved in Convex, rendered with the TipTap editor."}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          {searchQuery
            ? `No posts found matching "${searchQuery}"`
            : isAuthenticated
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




