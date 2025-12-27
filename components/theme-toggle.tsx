"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { usePathname } from "next/navigation";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Don't show toggle on homepage
  if (isHomepage) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`rounded-full ${
        theme === "dark"
          ? "border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700/50 hover:text-white"
          : "border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100 hover:text-gray-900"
      }`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-white" />
      ) : (
        <Moon className="h-4 w-4 text-gray-900" />
      )}
    </Button>
  );
}

