"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
        setThemeState(savedTheme);
      }
    }
  }, []);

  // Apply theme to document (but not on homepage - homepage always keeps its leafy green background)
  useEffect(() => {
    if (typeof window !== "undefined" && !isHomepage) {
      const root = document.documentElement;
      if (theme === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
    } else if (typeof window !== "undefined" && isHomepage) {
      // On homepage, always keep dark class for text colors but background is handled by homepage component
      const root = document.documentElement;
      root.classList.add("dark");
    }
  }, [theme, isHomepage]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

