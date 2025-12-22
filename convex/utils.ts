/**
 * Slug generation utility for creating URL-friendly strings from titles.
 * 
 * Converts titles to lowercase, removes special characters,
 * replaces spaces with hyphens, and trims extra hyphens.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and multiple spaces with single hyphen
    .replace(/\s+/g, "-")
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, "")
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Ensure slug is not empty (fallback to "post" if empty)
    || "post";
}


