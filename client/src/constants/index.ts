export const CATEGORIES = [
  { slug: "top", label: "Top Stories" },
  { slug: "technology", label: "Technology" },
  { slug: "business", label: "Business" },
  { slug: "sports", label: "Sports" },
  { slug: "entertainment", label: "Entertainment" },
  { slug: "health", label: "Health" },
  { slug: "science", label: "Science" },
  { slug: "world", label: "World" },
  { slug: "india", label: "India" },
  { slug: "politics", label: "Politics" },
] as const;

export const HOME_SECTIONS = [
  "technology",
  "business",
  "sports",
  "entertainment",
  "health",
  "science",
] as const;

export const INTEREST_CATEGORIES = [
  "technology",
  "business",
  "sports",
  "entertainment",
  "health",
  "science",
  "world",
  "india",
  "politics",
] as const;

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/category/top", label: "Top Stories" },
  { to: "/category/technology", label: "Technology" },
  { to: "/category/business", label: "Business" },
  { to: "/category/sports", label: "Sports" },
  { to: "/category/entertainment", label: "Entertainment" },
  { to: "/category/health", label: "Health" },
  { to: "/category/science", label: "Science" },
  { to: "/category/world", label: "World" },
  { to: "/category/india", label: "India" },
  { to: "/category/politics", label: "Politics" },
] as const;

/** Newspaper-style category navigation shown under the masthead. */
export const NAV_BAR = [
  { to: "/", label: "Home" },
  { to: "/category/india", label: "India" },
  { to: "/category/world", label: "World" },
  { to: "/category/politics", label: "Politics" },
  { to: "/category/business", label: "Business" },
  { to: "/category/technology", label: "Technology" },
  { to: "/category/sports", label: "Sports" },
  { to: "/category/entertainment", label: "Entertainment" },
  { to: "/category/science", label: "Science" },
  { to: "/category/health", label: "Health" },
  { to: "/category/top", label: "Top Stories" },
  { to: "/trending", label: "Trending" },
] as const;

export const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "relevance", label: "Most relevant" },
  { value: "popular", label: "Most read" },
] as const;

export const BRAND = {
  name: "DailyNews360",
  tagline: "Every Story. Every Angle.",
  taglineSecondary: "Your World, Updated Daily.",
  taglineAlternative: "Stay Informed. Stay Ahead.",
};

export const LOCAL_STORAGE_KEYS = {
  theme: "dn360:theme",
  bookmarks: "dn360:bookmarks",
  recentSearches: "dn360:recentSearches",
  mergedBookmarks: "dn360:mergedBookmarks",
} as const;