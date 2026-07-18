"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, X, Sparkles } from "lucide-react";
import Link from "next/link";

/**
 * Profile Setup Prompt Component
 *
 * Shows a friendly prompt encouraging users to set up their profile
 * after login/signup. Only shows if:
 * - User is authenticated
 * - User hasn't set up their profile (no bio or image)
 * - User hasn't dismissed the prompt (stored in localStorage)
 */
export function ProfileSetupPrompt() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has seen/dismissed the prompt before
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("profileSetupPromptDismissed");
      if (dismissed === "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsDismissed(true);
      }
    }
  }, []);

  // Don't show if loading, not authenticated, or dismissed
  if (isLoading || !isAuthenticated || !user || isDismissed) {
    return null;
  }

  // Check if user needs to set up profile
  // Show prompt if user doesn't have bio or image
  const needsSetup = !user.bio && !user.image;

  if (!needsSetup) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("profileSetupPromptDismissed", "true");
    }
  };

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="rounded-full bg-teal-50 p-2 border border-teal-100">
              <Sparkles className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Complete your profile
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Add a bio and profile picture to help readers get to know you
                better.
              </CardDescription>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-900 transition-colors rounded-full p-1 hover:bg-slate-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link href="/profile/edit" className="flex-1">
            <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800">
              <User className="h-4 w-4 mr-2" />
              Setup Profile
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
