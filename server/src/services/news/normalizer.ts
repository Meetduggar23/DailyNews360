import crypto from "node:crypto";
import { normalizeCategory, providerSourceUrl } from "./categoryMap.js";
import type { NewsArticle } from "./types.js";

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function firstString(...values: Array<unknown>): string | null {
  for (const value of values) {
    const cleaned = cleanText(value);
    if (cleaned) return cleaned;
  }
  return null;
}

function toIsoDate(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function makeId(
  provider: string,
  rawId: string | null | undefined,
  articleUrl: string | null | undefined,
  title: string,
): string {
  const seed = [rawId, articleUrl, title].filter(Boolean).join("|") || crypto.randomUUID();
  return crypto.createHash("sha1").update(`${provider}:${seed}`).digest("hex").slice(0, 20);
}

export interface NormalizedInput {
  provider: string;
  rawId?: string | null;
  title: string;
  description?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  sourceName?: string | null;
  articleUrl?: string | null;
  author?: string | null;
  publishedAt?: string | number | null;
  category?: string | null;
  country?: string | null;
  language?: string | null;
}

/**
 * Normalizes any provider's raw fields into the internal NewsArticle shape.
 * All aliases for a field (title/headline/name, image/urlToImage, ...) funnel
 * into a single canonical property.
 */
export function normalizeArticle(input: NormalizedInput): NewsArticle {
  const title = firstString(input.title) ?? "Untitled story";
  const articleUrl =
    firstString(input.articleUrl) ?? (input.rawId ? `https://noozra.com/api/articles?before=${input.rawId}` : "");

  return {
    id: makeId(input.provider, input.rawId, articleUrl, title),
    title,
    description: firstString(input.description),
    content: firstString(input.content),
    imageUrl: firstString(input.imageUrl),
    sourceName: firstString(input.sourceName) ?? "Unknown source",
    sourceUrl: articleUrl ? providerSourceUrl(input.provider, articleUrl) : "",
    articleUrl,
    author: firstString(input.author),
    publishedAt: toIsoDate(input.publishedAt) ?? new Date().toISOString(),
    category: normalizeCategory(input.category),
    country: firstString(input.country),
    language: firstString(input.language),
    provider: input.provider,
  };
}

/** Builds an id for a full article fetched by external url (used by /api/news/:id). */
export function fingerprintArticleUrl(url: string): string {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 20);
}