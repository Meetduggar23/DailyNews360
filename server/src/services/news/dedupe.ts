import type { NewsArticle } from "./types.js";

/**
 * Deduplication utilities.
 *
 * Uses two complementary strategies:
 *  - an exact fingerprint (normalized title + canonical url)
 *  - a title-similarity pass that collapses near-identical headlines
 */

function fingerprint(article: NewsArticle): string {
  const title = article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const url = new URL(article.articleUrl).pathname.replace(/[^a-z0-9]+/g, " ").trim();
  return `${title}|${url}`;
}

/** Jaccard similarity on word sets, used to compare titles. */
function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(
    a.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean),
  );
  const wordsB = new Set(
    b.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean),
  );
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

/**
 * Removes duplicate stories from a list.
 * - exact fingerprint dedupe always applies
 * - fuzzy dedupe only collapses pairs whose titles are at least `threshold`
 *   similar AND whose word lengths are comparable (avoids over-collapsing)
 */
export function deduplicateArticles(
  articles: NewsArticle[],
  options: { threshold?: number } = {},
): NewsArticle[] {
  const threshold = options.threshold ?? 0.75;
  const seenFingerprints = new Set<string>();
  const result: NewsArticle[] = [];

  for (const article of articles) {
    const fp = fingerprint(article);
    if (seenFingerprints.has(fp)) continue;
    seenFingerprints.add(fp);

    const titleWords = article.title.split(/\s+/).length;
    const isFuzzyDuplicate = result.some((existing) => {
      const existingWords = existing.title.split(/\s+/).length;
      const lengthRatio = Math.min(titleWords, existingWords) / Math.max(titleWords, existingWords);
      return lengthRatio >= 0.6 && titleSimilarity(article.title, existing.title) >= threshold;
    });

    if (!isFuzzyDuplicate) result.push(article);
  }

  return result;
}

/** Keeps the newest article from each source+story cluster. */
export function deduplicateBySource(articles: NewsArticle[]): NewsArticle[] {
  const newestBySource = new Map<string, NewsArticle>();
  for (const article of articles) {
    const key = `${article.sourceName.toLowerCase()}|${fingerprint(article)}`;
    const existing = newestBySource.get(key);
    if (!existing || (article.publishedAt ?? "").localeCompare(existing.publishedAt ?? "") > 0) {
      newestBySource.set(key, article);
    }
  }
  return [...newestBySource.values()];
}