/**
 * Maps provider-specific category slugs to DailyNews360 category slugs.
 * Provider adapters use their own slug as a fallback when no mapping exists.
 */
export const CATEGORY_ALIASES: Record<string, string> = {
  // Noozra
  tech: "technology",
  general: "top",
  finance: "business",
  culture: "entertainment",
  lifestyle: "health",
  ai: "technology",
  weather: "world",
  opinion: "politics",

  // GNews
  nation: "world",
  "national": "world",

  // Currents API
  technologie: "technology",
  science: "science",
};

export function normalizeCategory(raw: string | null | undefined): string {
  if (!raw) return "top";
  const slug = raw.trim().toLowerCase();
  const mapped = CATEGORY_ALIASES[slug];
  if (mapped) return mapped;
  return slug;
}

/**
 * Converts a DailyNews360 category slug to a provider's expected slug.
 * Returns the same slug when the provider uses compatible names.
 */
export function toProviderCategory(category: string, providerName: string): string {
  const slug = category.trim().toLowerCase();
  switch (providerName) {
    case "noozra": {
      const map: Record<string, string> = {
        top: "general",
        technology: "tech",
        business: "business",
        sports: "sports",
        entertainment: "entertainment",
        health: "health",
        science: "science",
        world: "world",
        india: "world",
        politics: "politics",
        trending: "general",
      };
      return map[slug] ?? slug;
    }
    case "gnews": {
      const map: Record<string, string> = {
        top: "general",
        technology: "technology",
        business: "business",
        sports: "sports",
        entertainment: "entertainment",
        health: "health",
        science: "science",
        world: "world",
        india: "general",
        politics: "general",
        trending: "general",
      };
      return map[slug] ?? slug;
    }
    default: {
      const map: Record<string, string> = {
        technology: "technology",
        business: "business",
        sports: "sports",
        entertainment: "entertainment",
        health: "health",
        science: "science",
        world: "world",
      };
      return map[slug] ?? "top";
    }
  }
}

export function providerSourceUrl(provider: string, articleUrl: string): string {
  try {
    const url = new URL(articleUrl);
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return articleUrl;
  }
}

/** Returns the readable label for a category slug. */
export function categoryLabel(slug: string): string {
  const labels: Record<string, string> = {
    top: "Top Stories",
    technology: "Technology",
    business: "Business",
    sports: "Sports",
    entertainment: "Entertainment",
    health: "Health",
    science: "Science",
    world: "World",
    india: "India",
    politics: "Politics",
    trending: "Trending",
  };
  return labels[slug] ?? slug;
}