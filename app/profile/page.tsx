"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { ProfileAvatar } from "@/components/profile-avatar";
import { PostCard } from "@/components/post-card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, Edit } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Get user's posts
  const posts = useQuery(
    api.posts.listByUser,
    isAuthenticated ? {} : "skip"
  );

  // Redirect to auth if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push("/auth?redirect=/profile");
    return null;
  }

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header Section */}
      <div className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <ProfileAvatar user={user} size="xl" />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {user.name || "User"}
                </h1>
                {user.email && (
                  <p className="text-muted-foreground mt-1">{user.email}</p>
                )}
              </div>
              
              <Link href="/profile/edit">
                <Button variant="outline" className="rounded-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* Bio */}
            {user.bio ? (
              <p className="text-slate-700 leading-relaxed max-w-2xl">
                {user.bio}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                No bio yet.{" "}
                <Link
                  href="/profile/edit"
                  className="text-slate-900 hover:underline font-medium"
                >
                  Add one
                </Link>{" "}
                to tell readers about yourself.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Posts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Posts</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {posts === undefined
                ? "Loading..."
                : posts.length === 0
                ? "No posts yet"
                : `${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
            </p>
          </div>
          
          <Link href="/create">
            <Button className="rounded-full">
              Write a post
            </Button>
          </Link>
        </div>

        {/* Posts Grid */}
        {posts === undefined ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t published any posts yet.
            </p>
            <Link href="/create">
              <Button className="rounded-full">
                Write your first post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

