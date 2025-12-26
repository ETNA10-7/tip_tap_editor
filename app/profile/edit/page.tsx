"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ArrowLeft, Save, User, Image as ImageIcon, FileText, AtSign, Check, X } from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const updateProfile = useMutation(api.users.updateProfile);
  const updateUsername = useMutation(api.users.updateUsername);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Check username availability
  const usernameAvailability = useQuery(
    api.users.checkUsernameAvailability,
    username.trim().length >= 3 && username.trim() !== user?.username
      ? { username: username.trim() }
      : "skip"
  );

  // Load user data into form
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setImage(user.image || "");
    }
  }, [user]);

  // Validate username on change
  useEffect(() => {
    if (username.trim().length > 0 && username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters long");
    } else if (username.trim().length > 30) {
      setUsernameError("Username must be no more than 30 characters long");
    } else if (username.trim() && !/^[a-z0-9-]+$/.test(username.trim().toLowerCase())) {
      setUsernameError("Username can only contain lowercase letters, numbers, and hyphens");
    } else if (username.trim() && (username.trim().startsWith("-") || username.trim().endsWith("-"))) {
      setUsernameError("Username cannot start or end with a hyphen");
    } else if (username.trim() && username.trim().includes("--")) {
      setUsernameError("Username cannot contain consecutive hyphens");
    } else {
      setUsernameError(null);
    }
  }, [username]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth?redirect=/profile/edit");
    }
  }, [isLoading, isAuthenticated, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      // Update username if it changed
      if (username.trim() && username.trim() !== user?.username) {
        if (usernameError) {
          setError("Please fix username errors before saving");
          setSaving(false);
          return;
        }
        
        if (usernameAvailability && !usernameAvailability.available) {
          setError(usernameAvailability.message || "Username is not available");
          setSaving(false);
          return;
        }

        try {
          await updateUsername({ username: username.trim() });
        } catch (err) {
          console.error("Username update error:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to update username. Please try again."
          );
          setSaving(false);
          return;
        }
      }

      // Update profile (name, bio, image)
      await updateProfile({
        name: name.trim() || undefined,
        bio: bio.trim() || undefined,
        image: image.trim() || undefined,
      });

      // Clear the dismissed flag so prompt can show again if they remove bio/image later
      if (typeof window !== "undefined") {
        localStorage.removeItem("profileSetupPromptDismissed");
      }

      setSuccess(true);
      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">
            Update your profile information and tell readers about yourself.
          </p>
        </div>
      </div>

      {/* Profile Edit Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your name, bio, and profile picture to personalize your profile.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center sm:items-start gap-4 pb-6 border-b">
              <div className="space-y-2 text-center sm:text-left w-full">
                <label className="text-sm font-medium text-slate-700">
                  Profile Picture
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ProfileAvatar user={{ ...user, image, name }} size="xl" />
                  <div className="flex-1 w-full sm:max-w-md space-y-2">
                    <Input
                      type="url"
                      placeholder="https://images.pexels.com/photos/..."
                      value={image}
                      onChange={(e) => {
                        setImage(e.target.value);
                        setImageError(null);
                      }}
                      onBlur={(e) => {
                        // Validate image URL format
                        const url = e.target.value.trim();
                        if (url && !url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) && !url.includes('images.pexels.com') && !url.includes('images.unsplash.com')) {
                          setImageError("Please use a direct image URL (ends with .jpg, .png, etc.)");
                        } else {
                          setImageError(null);
                        }
                      }}
                      disabled={saving}
                      className="w-full"
                    />
                    {imageError && (
                      <p className="text-xs text-red-600 mt-1">{imageError}</p>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Enter a direct image URL (must end with .jpg, .png, .gif, etc.)
                      </p>
                      <details className="text-xs">
                        <summary className="text-slate-600 cursor-pointer hover:text-slate-900">
                          How to get an image URL?
                        </summary>
                        <div className="mt-2 pl-4 space-y-2 text-muted-foreground">
                          <p className="font-medium text-slate-700">Universal method (works for any website):</p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Find an image you want to use on any website</li>
                            <li>Right-click on the image</li>
                            <li>Select "Copy image address" or "Copy image URL"</li>
                            <li>Paste the URL here</li>
                          </ol>
                          <p className="mt-2 font-medium text-slate-700">Popular image sources:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Pexels</a> - Free stock photos</li>
                            <li><a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Unsplash</a> - Free high-quality images</li>
                            <li><a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Imgur</a> - Upload your own images</li>
                            <li>Any website with publicly accessible images</li>
                          </ul>
                          <p className="mt-2 text-xs italic">Note: Make sure the image URL is publicly accessible and ends with an image file extension (.jpg, .png, .gif, .webp, etc.)</p>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                This is how your name will appear on your profile and posts.
              </p>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <AtSign className="h-4 w-4" />
                Username
              </label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="your-username"
                  value={username}
                  onChange={(e) => {
                    // Convert to lowercase and remove invalid characters as user types
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    setUsername(value);
                  }}
                  disabled={saving}
                  maxLength={30}
                  className={usernameError ? "border-red-500" : ""}
                />
                {username.trim() && username.trim() !== user?.username && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameAvailability === undefined ? (
                      <span className="text-xs text-muted-foreground">Checking...</span>
                    ) : usernameAvailability.available ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-xs">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <X className="h-4 w-4" />
                        <span className="text-xs">Taken</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="text-xs text-red-600">{usernameError}</p>
              )}
              {!usernameError && username.trim() && username.trim() !== user?.username && usernameAvailability && (
                <p className={`text-xs ${usernameAvailability.available ? "text-green-600" : "text-red-600"}`}>
                  {usernameAvailability.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Your username will be used in your profile URL: /users/{username || "your-username"}
                <br />
                Must be 3-30 characters, lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio
              </label>
              <Textarea
                id="bio"
                placeholder="Tell readers about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={saving}
                rows={5}
                maxLength={500}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Share a brief description about yourself. This will appear on your profile.
                </p>
                <p className="text-xs text-muted-foreground">
                  {bio.length}/500
                </p>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-800 font-medium">
                  Profile updated successfully! Redirecting...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t">
              <Link href="/profile">
                <Button type="button" variant="outline" disabled={saving}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full"
              >
                {saving ? (
                  <>
                    <span className="animate-pulse">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

