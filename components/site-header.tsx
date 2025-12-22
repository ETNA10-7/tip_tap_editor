"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile-menu";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";

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
    <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight flex-shrink-0">
          Mediumish
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative" ref={searchContainerRef}>
            <Search 
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors ${
                isSearchFocused ? "text-foreground" : ""
              }`}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
            
            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {/* Arrow pointing up */}
                <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45"></div>
                
                {searchResults === undefined ? (
                  <div className="px-4 py-3 text-sm text-slate-500">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">
                    No posts found
                  </div>
                ) : (
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      Posts
                    </div>
                    {searchResults.slice(0, 3).map((post) => (
                      <button
                        key={post._id}
                        onClick={() => handleResultClick(post.slug || generateSlug(post.title))}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-medium text-slate-900 text-sm line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </div>
                      </button>
                    ))}
                    {searchResults.length > 3 && (
                      <button
                        onClick={handleSearch}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors border-t border-slate-100 font-medium"
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

        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground flex-shrink-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            // Show profile menu with dropdown when authenticated
            <ProfileMenu user={user} />
          ) : (
            // Show sign in / sign up button when not authenticated
            <Link href="/auth">
              <Button variant="outline" className="rounded-full">
                Sign in / Sign up
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}




