"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { ProfileAvatar } from "@/components/profile-avatar";
import { PostCard } from "@/components/post-card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Mail, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { useTheme } from "@/contexts/theme-context";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [postView, setPostView] = useState<"published" | "drafts">("published");

  // Get user's posts
  const posts = useQuery(
    api.posts.listByUser,
    isAuthenticated ? {} : "skip"
  );

  // Separate published and draft posts
  const { publishedPosts, draftPosts } = useMemo(() => {
    if (!posts) return { publishedPosts: [], draftPosts: [] };
    const published = posts.filter(post => post.published !== false);
    const drafts = posts.filter(post => post.published === false);
    return { publishedPosts: published, draftPosts: drafts };
  }, [posts]);

  // Determine which posts to display based on view
  const displayedPosts = postView === "published" ? publishedPosts : draftPosts;

  // Open auth modal if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openModal("login");
    }
  }, [isLoading, isAuthenticated, openModal]);

  // Return null while redirecting or loading
  if (!isLoading && !isAuthenticated) {
    return null;
  }

  // Show loading state
  if (isLoading || !user) {
    return (
      <>
        {isLightMode && (
          <div 
            className="fixed inset-0 -z-10"
            style={{ backgroundColor: 'var(--leafy-green, #B8DB80)' }}
          />
        )}
        <div className="space-y-6 relative z-0">
          <div className="flex items-center justify-center py-12">
            <p className={isLightMode ? "text-black" : "text-muted-foreground"}>Loading profile...</p>
          </div>
        </div>
      </>
    );
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
      <div className="space-y-8 relative z-0">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <ProfileAvatar user={user} size="xl" />
            </div>
            
            {/* User Info */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h1 className={`text-3xl font-bold truncate ${isLightMode ? "text-black" : "text-slate-900"}`}>
                    {user.name || "User"}
                  </h1>
                  {user.email && (
                    <div className={`flex items-center gap-2 ${isLightMode ? "text-black" : "text-muted-foreground"}`}>
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                </div>
                
                <Link href="/profile/edit">
                  <Button variant="outline" className="rounded-full w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>

              {/* Bio */}
              {user.bio ? (
                <div className="pt-2">
                  <p className={`leading-relaxed ${isLightMode ? "text-black" : "text-slate-700"}`}>
                    {user.bio}
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  <p className={`italic ${isLightMode ? "text-black" : "text-muted-foreground"}`}>
                    No bio yet.{" "}
                    <Link
                      href="/profile/edit"
                      className={`hover:underline font-medium ${isLightMode ? "text-blue-700" : "text-slate-900"}`}
                    >
                      Add one
                    </Link>{" "}
                    to tell readers about yourself.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Posts
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={postView === "published" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostView("published")}
                    className="rounded-full"
                  >
                    Published ({publishedPosts.length})
                  </Button>
                  <Button
                    variant={postView === "drafts" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostView("drafts")}
                    className="rounded-full"
                  >
                    Drafts ({draftPosts.length})
                  </Button>
                </div>
              </div>
              <CardDescription className="mt-1">
                {posts === undefined
                  ? "Loading your posts..."
                  : postView === "published"
                  ? `${publishedPosts.length} ${publishedPosts.length === 1 ? "post" : "posts"} published`
                  : `${draftPosts.length} ${draftPosts.length === 1 ? "draft" : "drafts"} saved`}
              </CardDescription>
            </div>
            
            <Link href="/create">
              <Button className="rounded-full w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Write a post
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {/* Posts Grid */}
          {posts === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-pulse text-muted-foreground">
                  Loading posts...
                </div>
              </div>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className={`font-medium ${isLightMode ? "text-black" : "text-slate-700"}`}>
                    {postView === "published"
                      ? "You haven't published any posts yet."
                      : "You don't have any drafts yet."}
                  </p>
                  <p className={`text-sm ${isLightMode ? "text-black" : "text-muted-foreground"}`}>
                    {postView === "published"
                      ? "Start sharing your thoughts with the world!"
                      : "Create a draft to save your work in progress."}
                  </p>
                </div>
                {postView === "published" && (
                  <Link href="/create">
                    <Button className="rounded-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Write your first post
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="posts-scrollable overflow-y-auto max-h-[450px] pr-2">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayedPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}

