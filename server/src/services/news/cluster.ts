import type { NewsArticle } from "./types.js";
import { scoreArticle } from "./ranker.js";

/**
 * "Every Story. Every Angle." story clustering.
 *
 * Groups articles from different sources that are covering the same event
 * into a single cluster so readers can compare coverage across outlets.
 *
 * Similarity is computed from a normalized-title Jaccard score blended with a
 * weaker description overlap, gated by a publication-time window.
 */

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for",
  "with", "as", "by", "from", "is", "are", "was", "were", "be", "been", "has",
  "have", "had", "it", "its", "this", "that", "these", "those", "his", "her",
  "their", "our", "you", "your", "we", "they", "he", "she", "i", "up", "down",
  "out", "over", "under", "again", "about", "into", "than", "so", "can", "will",
  "just", "says", "said", "after", "before", "who", "what", "when",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = new Set([...a].filter((w) => b.has(w)));
  const union = new Set([...a, ...b]);
  return intersection.size / union.size;
}

/**
 * Combined similarity score between two stories:
 *   - 70% overlap of meaningful title keywords (Jaccard)
 *   - 30% overlap of description keywords (Jaccard)
 */
export function storySimilarity(a: NewsArticle, b: NewsArticle): number {
  const titleA = tokenize(a.title);
  const titleB = tokenize(b.title);
  if (titleA.length === 0 || titleB.length === 0) return 0;

  const titleSim = jaccard(new Set(titleA), new Set(titleB));

  const descA = tokenize(a.description ?? "");
  const descB = tokenize(b.description ?? "");
  const descSim = descA.length > 0 && descB.length > 0 ? jaccard(new Set(descA), new Set(descB)) : 0;

  // Require at least one shared meaningful keyword to avoid random titles.
  const sharesKeyword = titleA.some((w) => titleB.includes(w));
  if (!sharesKeyword) return 0;

  return titleSim * 0.7 + descSim * 0.3;
}

/** Normalized title used for stable cluster ids. */
export function normalizeTitle(title: string): string {
  return tokenize(title).join(" ");
}

export interface StoryCluster {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  sourceName: string;
  publishedAt: string;
  articleCount: number;
  sources: string[];
  articles: NewsArticle[];
}

export interface ClusterOptions {
  /** Minimum number of sources needed for a cluster to be reported. */
  minSources?: number;
  /** Similarity threshold in [0, 1]. */
  threshold?: number;
  /** Maximum age window in hours between stories in a cluster. */
  maxAgeHours?: number;
}

const DEFAULT_OPTIONS: Required<ClusterOptions> = {
  minSources: 2,
  threshold: 0.5,
  maxAgeHours: 72,
};

/**
 * Greedy clustering over a pool of articles. Each cluster keeps the newest
 * representative article as its lead and lists every contributing source.
 */
export function clusterArticles(
  pool: NewsArticle[],
  options: ClusterOptions = {},
): StoryCluster[] {
  const { minSources, threshold, maxAgeHours } = { ...DEFAULT_OPTIONS, ...options };
  const sorted = [...pool].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const assigned = new Set<string>();
  const clusters: StoryCluster[] = [];

  for (const lead of sorted) {
    if (assigned.has(lead.id)) continue;

    const members: NewsArticle[] = [lead];
    const leadTime = new Date(lead.publishedAt).getTime();

    for (const candidate of sorted) {
      if (candidate.id === lead.id || assigned.has(candidate.id)) continue;
      const candidateTime = new Date(candidate.publishedAt).getTime();
      const withinWindow = Math.abs(candidateTime - leadTime) <= maxAgeHours * 60 * 60 * 1000;
      if (!withinWindow) continue;
      if (storySimilarity(lead, candidate) < threshold) continue;
      members.push(candidate);
    }

    // A cluster only matters when it represents multiple independent sources.
    const sources = new Set(members.map((m) => m.sourceName.toLowerCase()));
    if (sources.size < minSources) {
      for (const member of members) assigned.add(member.id);
      continue;
    }

    const byScore = [...members].sort(
      (a, b) =>
        scoreArticle({ article: b }) - scoreArticle({ article: a }) ||
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    const representative = byScore[0]!;

    for (const member of members) assigned.add(member.id);

    clusters.push({
      id: `cluster-${Buffer.from(normalizeTitle(representative.title)).toString("base64url").slice(0, 20)}`,
      title: representative.title,
      description: representative.description,
      imageUrl: representative.imageUrl,
      category: representative.category,
      sourceName: representative.sourceName,
      publishedAt: representative.publishedAt,
      articleCount: members.length,
      sources: [...new Set(members.map((m) => m.sourceName))],
      articles: byScore,
    });
  }

  return clusters.sort((a, b) => {
    const sizeDiff = b.articleCount - a.articleCount;
    if (sizeDiff !== 0) return sizeDiff;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

/** Finds the cluster that contains a given article id, if any. */
export function findClusterById(
  pool: NewsArticle[],
  articleId: string,
  options: ClusterOptions = {},
): StoryCluster | null {
  const article = pool.find((a) => a.id === articleId);
  if (!article) return null;
  const cluster = clusterArticles(pool, options).find((c) =>
    c.articles.some((a) => a.id === articleId),
  );
  if (!cluster) return null;
  return {
    ...cluster,
    articles: cluster.articles.filter((a) => a.id !== articleId),
  };
}