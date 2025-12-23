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

  // Fetch user by username
  const user = useQuery(
    api.users.getByUsername,
    username ? { username } : "skip"
  );

  // Fetch user's posts if user exists
  const posts = useQuery(
    api.posts.listByAuthorId,
    user ? { authorId: user._id } : "skip"
  );

  // Loading state
  if (user === undefined || posts === undefined) {
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

      {/* Posts Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Posts
              </CardTitle>
              <CardDescription className="mt-1">
                {posts === undefined
                  ? "Loading posts..."
                  : posts.length === 0
                  ? "No posts yet"
                  : `${posts.length} ${posts.length === 1 ? "post" : "posts"} published`}
              </CardDescription>
            </div>
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
          ) : posts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-700 font-medium">
                    {user.name || "This user"} hasn&apos;t published any posts yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new content!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


