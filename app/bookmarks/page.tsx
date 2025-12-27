"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export default function BookmarksPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const isLightMode = theme === "light";
  const bookmarkedPosts = useQuery(
    api.postInteractions.getBookmarkedPosts,
    isAuthenticated ? {} : "skip"
  );

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <>
        {isLightMode && (
          <div 
            className="fixed inset-0 -z-10"
            style={{ backgroundColor: 'var(--leafy-green, #B8DB80)' }}
          />
        )}
        <div className="max-w-6xl mx-auto px-4 py-8 relative z-0">
          <p className={isLightMode ? "text-black" : "text-muted-foreground"}>Loading...</p>
        </div>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <>
      {/* Green background overlay for light mode only */}
      {isLightMode && (
        <div 
          className="fixed inset-0 -z-10"
          style={{ backgroundColor: 'var(--leafy-green, #B8DB80)' }}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-0">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className={`h-6 w-6 ${isLightMode ? "text-black" : "text-slate-600"}`} />
            <h1 className={`text-3xl font-bold ${isLightMode ? "text-black" : "text-slate-900"}`}>My Bookmarks</h1>
          </div>
          <p className={isLightMode ? "text-black" : "text-slate-600"}>
            Posts you've saved for later reading
          </p>
        </div>

        {bookmarkedPosts === undefined ? (
          <div className="text-center py-12">
            <p className={isLightMode ? "text-black" : "text-muted-foreground"}>Loading bookmarks...</p>
          </div>
        ) : bookmarkedPosts.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className={`h-12 w-12 mx-auto mb-4 ${isLightMode ? "text-black" : "text-slate-300"}`} />
            <h2 className={`text-xl font-semibold mb-2 ${isLightMode ? "text-black" : "text-slate-900"}`}>
              No bookmarks yet
            </h2>
            <p className={`mb-4 ${isLightMode ? "text-black" : "text-slate-600"}`}>
              Start bookmarking posts to save them for later reading.
            </p>
            <a
              href="/posts"
              className={`inline-block rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isLightMode
                  ? "border-gray-300 bg-white text-black hover:bg-gray-50"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Browse Posts
            </a>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedPosts.map(({ post, author }) => (
            <PostCard
              key={post._id}
              post={{
                ...post,
                author: author || null,
              }}
            />
          ))}
        </div>
        )}
      </div>
    </>
  );
}








