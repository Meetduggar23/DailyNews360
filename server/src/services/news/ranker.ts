import type { NewsArticle, SortOption } from "./types.js";

export interface RankingWeights {
  recency: number;
  relevance: number;
  popularity: number;
  userInterest: number;
}

export const DEFAULT_WEIGHTS: RankingWeights = {
  recency: 0.4,
  relevance: 0.3,
  popularity: 0.15,
  userInterest: 0.15,
};

/** Number of articles the aggregator has been tracking for popularity signal. */
let activityCount = 0;

export function recordActivity(): void {
  activityCount += 1;
}

export function getActivityCount(): number {
  return activityCount;
}

/** Half-life decay for recency: newer articles score higher. */
function recencyScore(publishedAt: string | null): number {
  if (!publishedAt) return 0;
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  if (ageMs < 0) return 1;
  const halfLifeMs = 6 * 60 * 60 * 1000; // 6 hours
  return Math.pow(0.5, ageMs / halfLifeMs);
}

export function sourcePopularity(sourceName: string): number {
  // Deterministic popularity from a stable hash of the source name.
  let hash = 0;
  for (let i = 0; i < sourceName.length; i++) {
    hash = (hash * 31 + sourceName.charCodeAt(i)) | 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return 0.5 + normalized * 0.5;
}

function textRelevance(article: NewsArticle, query?: string): number {
  if (!query) return 0;
  const haystack = `${article.title} ${article.description ?? ""} ${article.category}`
    .toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  let matches = 0;
  for (const word of words) {
    if (haystack.includes(word)) matches += 1;
  }
  return matches / words.length;
}

export interface RankInput {
  article: NewsArticle;
  query?: string;
  userCategories?: string[];
  bookmarkedCategories?: string[];
}

/**
 * Transparent, deterministic rule-based ranking. Not AI.
 *
 * Scoring factors (configurable weights):
 *   recency  40%   - how fresh the story is
 *   relevance 30%  - keyword overlap with the query
 *   popularity 15% - stable source popularity signal
 *   userInterest 15% - overlap with the user's preferred categories
 */
export function scoreArticle(input: RankInput, weights: RankingWeights = DEFAULT_WEIGHTS): number {
  const { article, query, userCategories, bookmarkedCategories } = input;

  const recency = recencyScore(article.publishedAt);

  let relevance = textRelevance(article, query);
  // Always return at least a floor so relevance-only results still surface.
  if (relevance > 0) relevance = 0.4 + relevance * 0.6;

  const popularity = sourcePopularity(article.sourceName);

  const interestSet = new Set([...(userCategories ?? []), ...(bookmarkedCategories ?? [])]);
  const userInterest = interestSet.size > 0 && interestSet.has(article.category) ? 1 : 0;

  return (
    weights.recency * recency +
    weights.relevance * relevance +
    weights.popularity * popularity +
    weights.userInterest * userInterest
  );
}

export function rankArticles(
  articles: NewsArticle[],
  options: {
    query?: string;
    userCategories?: string[];
    bookmarkedCategories?: string[];
  } = {},
  weights: RankingWeights = DEFAULT_WEIGHTS,
): NewsArticle[] {
  return articles
    .map((article) => ({
      article,
      score: scoreArticle({ article, ...options }, weights),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.article);
}

export function sortArticles(articles: NewsArticle[], sort: SortOption = "latest"): NewsArticle[] {
  const copy = [...articles];
  if (sort === "latest") {
    return copy.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }
  if (sort === "popular") {
    return rankArticles(copy, {});
  }
  return copy; // relevance is applied by callers that have a query
}

/** Popularity-heavy ranking used by the "Most Read" editorial list. */
export const MOST_READ_WEIGHTS: RankingWeights = {
  recency: 0.15,
  relevance: 0.2,
  popularity: 0.5,
  userInterest: 0.15,
};

export function rankByPopularity(
  articles: NewsArticle[],
  options: {
    userCategories?: string[];
    bookmarkedCategories?: string[];
  } = {},
): NewsArticle[] {
  return rankArticles(articles, options, MOST_READ_WEIGHTS);
}