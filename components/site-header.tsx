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
  const { openModal } = useAuthModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
    <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur sticky top-0 z-40 dark:border-slate-700 dark:bg-slate-900/95 border-gray-200 bg-white/95">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight flex-shrink-0 text-white dark:text-white text-gray-900">
          Mediumish
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative" ref={searchContainerRef}>
            <Search 
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors dark:text-slate-400 text-gray-400 ${
                isSearchFocused ? "text-slate-300 dark:text-slate-300 text-gray-500" : ""
              }`}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-600 bg-slate-800/50 text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all dark:border-slate-600 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-slate-500 dark:focus:border-slate-500 border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-gray-300 focus:border-gray-300"
            />
            
            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto dark:bg-slate-800 dark:border-slate-700 bg-white border-gray-200">
                {/* Arrow pointing up */}
                <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-800 border-l border-t border-slate-700 rotate-45 dark:bg-slate-800 dark:border-slate-700 bg-white border-gray-200"></div>
                
                {searchResults === undefined ? (
                  <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-400 text-gray-500">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-400 text-gray-500">
                    No posts found
                  </div>
                ) : (
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 dark:text-slate-400 dark:border-slate-700 text-gray-500 border-gray-200">
                      Posts
                    </div>
                    {searchResults.slice(0, 3).map((post) => (
                      <button
                        key={post._id}
                        onClick={() => handleResultClick(post.slug || generateSlug(post.title))}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-700/50 transition-colors dark:hover:bg-slate-700/50 hover:bg-gray-100"
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
                            <div className="font-medium text-white text-sm line-clamp-1 dark:text-white text-gray-900">
                              {post.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 text-gray-500">
                              <span className="font-medium text-slate-300 dark:text-slate-300 text-gray-700">
                                {post.author?.name || "Anonymous"}
                              </span>
                              <span className="text-slate-600 dark:text-slate-600 text-gray-400">•</span>
                              <span className="text-slate-400 dark:text-slate-400 text-gray-500">
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
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors border-t border-slate-700 font-medium dark:text-slate-300 dark:hover:bg-slate-700/50 dark:border-slate-700 text-gray-700 hover:bg-gray-100 border-gray-200"
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

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300 flex-shrink-0 dark:text-slate-300 text-gray-600">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white dark:hover:text-white hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            // Show profile menu with dropdown when authenticated
            <ProfileMenu user={user} />
          ) : (
            // Show sign in / sign up button when not authenticated
            <Button 
              variant="outline" 
              className="rounded-full border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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




