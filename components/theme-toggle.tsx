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
      className="rounded-full border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-600 dark:hover:bg-gray-100 dark:hover:text-gray-900"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

