"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile-menu";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/theme-context";

/**
 * Generate slug from title (client-side, matches server-side logic)
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "post";
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/create", label: "Write" },
];

export function SiteHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { openModal } = useAuthModal();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const isHomepage = pathname === "/";
  const isLightMode = theme === "light" && !isHomepage;

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results when debounced query changes (trigger with 1+ character)
  const searchResults = useQuery(
    api.posts.search,
    debouncedQuery.trim().length >= 1 ? { query: debouncedQuery.trim() } : "skip"
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }

    if (isSearchFocused) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchFocused]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/posts?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchFocused(false);
    }
  };

  const handleResultClick = (slug: string) => {
    router.push(`/posts/${slug}`);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const showDropdown = isSearchFocused && debouncedQuery.trim().length >= 1 && searchResults !== undefined;

  return (
    <header className={`border-b sticky top-0 z-40 backdrop-blur ${isHomepage ? "homepage-header" : ""} ${
      isHomepage || isLightMode
        ? "border-gray-200 bg-white" 
        : "border-slate-700 bg-slate-900/95 dark:border-slate-700 dark:bg-slate-900/95"
    }`}>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 gap-4">
        <Link href="/" className={`text-lg font-semibold tracking-tight flex-shrink-0 homepage-text-black ${
          isHomepage || isLightMode
            ? "!text-black" 
            : "text-white dark:text-white"
        }`}>
          Mediumish
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative" ref={searchContainerRef}>
            <Search 
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                isHomepage || isLightMode
                  ? `text-gray-400 ${isSearchFocused ? "text-gray-500" : ""}`
                  : `text-white ${isSearchFocused ? "text-white" : ""}`
              }`}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className={`w-full pl-10 pr-4 py-2 rounded-full border text-sm focus:outline-none focus:ring-2 transition-all ${
                isHomepage || isLightMode
                  ? "border-black bg-gray-50 !text-black placeholder:text-gray-400 focus:ring-black focus:border-black caret-black homepage-search-input"
                  : "border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-400 focus:ring-slate-500 focus:border-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-slate-500 dark:focus:border-slate-500"
              }`}
            />
            
            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto ${
                isHomepage
                  ? "bg-white border border-gray-200"
                  : "bg-slate-800 border border-slate-700 dark:bg-slate-800 dark:border-slate-700 bg-white border-gray-200"
              }`}>
                {/* Arrow pointing up */}
                <div className={`absolute -top-1.5 left-6 w-3 h-3 rotate-45 ${
                  isHomepage
                    ? "bg-white border-l border-t border-gray-200"
                    : "bg-slate-800 border-l border-t border-slate-700 dark:bg-slate-800 dark:border-slate-700 bg-white border-gray-200"
                }`}></div>
                
                {searchResults === undefined ? (
                  <div className={`px-4 py-3 text-sm ${
                    isHomepage ? "text-gray-500" : "text-slate-400 dark:text-slate-400 text-gray-500"
                  }`}>
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className={`px-4 py-3 text-sm ${
                    isHomepage ? "text-gray-500" : "text-slate-400 dark:text-slate-400 text-gray-500"
                  }`}>
                    No posts found
                  </div>
                ) : (
                  <div className="py-1">
                    <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${
                      isHomepage
                        ? "text-gray-500 border-gray-200"
                        : "text-slate-400 border-slate-700 dark:text-slate-400 dark:border-slate-700 text-gray-500 border-gray-200"
                    }`}>
                      Posts
                    </div>
                    {searchResults.slice(0, 3).map((post) => (
                      <button
                        key={post._id}
                        onClick={() => handleResultClick(post.slug || generateSlug(post.title))}
                        className={`w-full text-left px-4 py-2.5 transition-colors ${
                          isHomepage
                            ? "hover:bg-gray-100"
                            : "hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <ProfileAvatar
                            user={
                              post.author
                                ? {
                                    _id: post.author._id,
                                    name: post.author.name,
                                    image: post.author.image,
                                    email: undefined,
                                    username: post.author.username,
                                  } as any
                                : null
                            }
                            size="sm"
                          />
                          <div className="flex flex-col gap-1">
                            <div className={`font-medium text-sm line-clamp-1 ${
                              isHomepage || isLightMode
                                ? "text-gray-900"
                                : "text-white dark:text-white"
                            }`}>
                              {post.title}
                            </div>
                            <div className={`flex items-center gap-2 text-xs ${
                              isHomepage || isLightMode
                                ? "text-gray-500"
                                : "text-slate-400 dark:text-slate-400"
                            }`}>
                              <span className={`font-medium ${
                                isHomepage || isLightMode
                                  ? "text-gray-700"
                                  : "text-slate-300 dark:text-slate-300"
                              }`}>
                                {post.author?.name || "Anonymous"}
                              </span>
                              <span className={isHomepage || isLightMode ? "text-gray-400" : "text-slate-600 dark:text-slate-600"}>•</span>
                              <span className={isHomepage || isLightMode ? "text-gray-500" : "text-slate-400 dark:text-slate-400"}>
                                {format(new Date(post.createdAt), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {searchResults.length > 3 && (
                      <button
                        onClick={handleSearch}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors border-t ${
                          isHomepage || isLightMode
                            ? "text-gray-700 hover:bg-gray-100 border-gray-200"
                            : "text-slate-300 hover:bg-slate-700/50 border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:border-slate-700"
                        }`}
                      >
                        View all {searchResults.length} results
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <nav className={`flex items-center gap-6 text-sm font-medium flex-shrink-0 ${
          isHomepage || isLightMode
            ? "text-gray-600"
            : "text-white"
        }`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition ${
                isHomepage || isLightMode
                  ? "hover:text-gray-900"
                  : "hover:text-gray-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isHomepage && <ThemeToggle />}
          {user ? (
            // Show profile menu with dropdown when authenticated
            <ProfileMenu user={user} />
          ) : (
            // Show sign in / sign up button when not authenticated
            <Button 
              variant="outline" 
              className={`rounded-full ${
                isHomepage
                  ? "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  : "border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => openModal("login")}
            >
              Sign in / Sign up
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}




