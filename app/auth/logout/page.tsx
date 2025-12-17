"use client";

import { useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut();
        router.push("/");
        router.refresh();
      } catch (err) {
        console.error("Logout error:", err);
        // Even if there's an error, redirect to home
        router.push("/");
      }
    };

    handleLogout();
  }, [signOut, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing out...</p>
    </div>
  );
}



