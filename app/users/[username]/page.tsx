"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { ProfileAvatar } from "@/components/profile-avatar";
import { PostCard } from "@/components/post-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

/**
 * Get the earliest creation date from user's posts or authAccounts
 * For now, we'll use a placeholder since we don't have join date in users table
 */
function getJoinDate(user: any): Date | null {
  // If we had a createdAt field in users, we'd use that
  // For now, return null and show nothing
  return null;
}

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username as string | undefined;
  const { user: currentUser } = useAuth();

  // Fetch user by username
  const user = useQuery(
    api.users.getByUsername,
    username ? { username } : "skip"
  );

  // Check if viewing own profile
  const isOwnProfile = currentUser && user && currentUser._id === user._id;

  // Fetch posts:
  // - If viewing own profile: use listByUser to get all posts (including drafts)
  // - If viewing other user's profile: use listByAuthorId (only published posts)
  const allPosts = useQuery(
    isOwnProfile
      ? api.posts.listByUser
      : api.posts.listByAuthorId,
    user
      ? isOwnProfile
        ? {}
        : { authorId: user._id }
      : "skip"
  );

  // Separate published and draft posts when viewing own profile
  const publishedPosts = allPosts?.filter(post => post.published !== false) ?? [];
  const draftPosts = allPosts?.filter(post => post.published === false) ?? [];

  // Loading state
  if (user === undefined || allPosts === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // User not found
  if (user === null || !username) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-slate-900">
                User Not Found
              </h1>
              <p className="text-muted-foreground">
                The user &quot;{username}&quot; does not exist or could not be found.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Link href="/posts">
                  <button className="rounded-full border px-4 py-2 text-sm hover:bg-slate-50 transition-colors">
                    Browse Posts
                  </button>
                </Link>
                <Link href="/">
                  <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
                    Go Home
                  </button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const joinDate = getJoinDate(user);

  return (
    <div className="space-y-8">
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
              <div className="space-y-1 min-w-0">
                <h1 className="text-3xl font-bold text-slate-900 truncate">
                  {user.name || "Anonymous User"}
                </h1>
                {user.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {joinDate && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Joined {format(joinDate, "MMMM yyyy")}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {user.bio ? (
                <div className="pt-2">
                  <p className="text-slate-700 leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  <p className="text-muted-foreground italic">
                    No bio available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Published Posts Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isOwnProfile ? "Published Posts" : "Posts"}
              </CardTitle>
              <CardDescription className="mt-1">
                {allPosts === undefined
                  ? "Loading posts..."
                  : publishedPosts.length === 0
                  ? "No posts yet"
                  : `${publishedPosts.length} ${publishedPosts.length === 1 ? "post" : "posts"} published`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Published Posts Grid */}
          {allPosts === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-pulse text-muted-foreground">
                  Loading posts...
                </div>
              </div>
            </div>
          ) : publishedPosts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-700 font-medium">
                    {isOwnProfile
                      ? "You haven't published any posts yet."
                      : `${user.name || "This user"} hasn't published any posts yet.`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile
                      ? "Start writing to share your thoughts!"
                      : "Check back later for new content!"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {publishedPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draft Posts Section (only shown when viewing own profile) */}
      {isOwnProfile && draftPosts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Drafts
                </CardTitle>
                <CardDescription className="mt-1">
                  {draftPosts.length} {draftPosts.length === 1 ? "draft" : "drafts"} saved
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {draftPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


