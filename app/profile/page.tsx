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
                  <h1 className="text-3xl font-bold text-slate-900 truncate">
                    {user.name || "User"}
                  </h1>
                  {user.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
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
                  <p className="text-slate-700 leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              ) : (
                <div className="pt-2">
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
                  ? "Loading your posts..."
                  : posts.length === 0
                  ? "No posts yet"
                  : `${posts.length} ${posts.length === 1 ? "post" : "posts"} published`}
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
          ) : posts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-700 font-medium">
                    You haven&apos;t published any posts yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start sharing your thoughts with the world!
                  </p>
                </div>
                <Link href="/create">
                  <Button className="rounded-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Write your first post
                  </Button>
                </Link>
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

