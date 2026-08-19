import type { NewsArticle } from "./news/types.js";

export interface PersonalizationSignals {
  preferredCategories: string[];
  readingCategories: string[];
  bookmarkedCategories: string[];
  sources: string[];
}

export interface ScoredArticle {
  article: NewsArticle;
  score: number;
}

/**
 * PersonalizationService
 *
 * A transparent, rule-based ranking for the "For You" feed. It combines:
 *   - category preference (from UserPreference)
 *   - recent reading (from ReadingHistory)
 *   - bookmarks (from Bookmark)
 *   - article recency
 *
 * This is deliberately simple and deterministic - not a machine-learning
 * model. The scoring function is isolated so it can be swapped later.
 */
export class PersonalizationService {
  buildSignals(
    preferredCategories: string[],
    reading: Array<{ category: string | null; source: string | null }>,
    bookmarks: Array<{ category?: string | null }>,
  ): PersonalizationSignals {
    return {
      preferredCategories: [...new Set(preferredCategories.map((c) => c.toLowerCase()))],
      readingCategories: [
        ...new Set(
          reading
            .map((entry) => entry.category)
            .filter((c): c is string => Boolean(c))
            .map((c) => c.toLowerCase()),
        ),
      ],
      bookmarkedCategories: [
        ...new Set(
          bookmarks
            .map((entry) => entry.category)
            .filter((c): c is string => Boolean(c))
            .map((c) => c.toLowerCase()),
        ),
      ],
      sources: [
        ...new Set(
          reading
            .map((entry) => entry.source)
            .filter((s): s is string => Boolean(s)),
        ),
      ],
    };
  }

  /**
   * Ranks a pool of articles for a user. The score is an additive model:
   *
   *   base = recency score (from the ranker)
   *   +2   if the category is explicitly preferred
   *   +1.5 if the category matches recent reading behaviour
   *   +1   if the category appears in bookmarks
   *   +1   if the source was read before
   */
  score(article: NewsArticle, signals: PersonalizationSignals): number {
    const base = recencyComponent(article);
    const category = article.category.toLowerCase();

    let score = base;
    if (signals.preferredCategories.includes(category)) score += 2;
    if (signals.readingCategories.includes(category)) score += 1.5;
    if (signals.bookmarkedCategories.includes(category)) score += 1;
    if (signals.sources.includes(article.sourceName)) score += 1;

    return score;
  }

  /**
   * Sorts the candidate pool by personalized score, keeping a small random
   * jitter so the feed does not feel identical on every visit.
   */
  rank(
    candidates: NewsArticle[],
    signals: PersonalizationSignals,
    options: { jitter?: number } = {},
  ): NewsArticle[] {
    const jitter = options.jitter ?? 0.05;
    const seeded = candidates.map((article) => ({
      article,
      score: this.score(article, signals) + (Math.random() - 0.5) * jitter,
    }));
    seeded.sort((a, b) => b.score - a.score);
    return seeded.map((entry) => entry.article);
  }
}

function recencyComponent(article: NewsArticle): number {
  const ageMs = Date.now() - new Date(article.publishedAt).getTime();
  if (ageMs < 0) return 1;
  const halfLifeMs = 6 * 60 * 60 * 1000;
  return Math.pow(0.5, ageMs / halfLifeMs);
}

export const personalizationService = new PersonalizationService();