"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export default function PostsPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [view, setView] = useState<"all" | "mine">("all");

  // Reset to "all" when running a search
  useEffect(() => {
    if (searchQuery) {
      setView("all");
    }
  }, [searchQuery]);

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
    !searchQuery ? {} : "skip"
  );
  
  // Determine which posts to display
  const posts = useMemo(() => {
    if (searchQuery) return searchResults ?? [];
    if (view === "mine" && isAuthenticated) return userPosts ?? [];
    return allPosts ?? [];
  }, [searchQuery, searchResults, view, isAuthenticated, userPosts, allPosts]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">
            {searchQuery 
              ? `Search results for "${searchQuery}"` 
              : view === "mine" && isAuthenticated
                ? "My posts"
                : "All posts"}
          </h1>
          <p className="text-muted-foreground">
            {searchQuery
              ? `Found ${posts.length} ${posts.length === 1 ? "post" : "posts"}`
              : view === "mine" && isAuthenticated
                ? "Posts you've created, saved in Convex."
                : "Stories saved in Convex, rendered with the TipTap editor."}
          </p>
        </div>

        {!searchQuery && (
          <div className="flex items-center gap-2">
            <Button
              variant={view === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("all")}
            >
              All posts
            </Button>
            <Button
              variant={view === "mine" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("mine")}
              disabled={!isAuthenticated}
            >
              My posts
            </Button>
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          {searchQuery
            ? `No posts found matching "${searchQuery}"`
            : view === "mine" && isAuthenticated
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




