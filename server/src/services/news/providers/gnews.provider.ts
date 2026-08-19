import { env } from "../../../config/env.js";
import { logger } from "../../../lib/logger.js";
import { toProviderCategory } from "../categoryMap.js";
import { normalizeArticle } from "../normalizer.js";
import type { NewsArticle, NewsProvider, NewsQuery } from "../types.js";

interface GNewsArticle {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string; url?: string } | string;
  author?: string;
}

interface GNewsResponse {
  totalArticles?: number;
  articles?: GNewsArticle[];
  status?: string;
  errors?: string[];
}

const REQUEST_TIMEOUT_MS = 10_000;
const BASE_URL = "https://gnews.io/api/v4";

async function fetchJson(path: string): Promise<GNewsResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
    if (res.status === 429) {
      throw new Error("GNews rate limited (429)");
    }
    if (!res.ok) {
      throw new Error(`GNews request failed with status ${res.status}`);
    }
    return (await res.json()) as GNewsResponse;
  } finally {
    clearTimeout(timeout);
  }
}

function map(raw: GNewsArticle): NewsArticle {
  const sourceName =
    typeof raw.source === "string"
      ? raw.source
      : raw.source?.name ?? "Unknown source";
  const sourceUrl =
    typeof raw.source === "string" ? raw.url ?? "" : raw.source?.url ?? raw.url ?? "";

  return normalizeArticle({
    provider: "gnews",
    title: raw.title ?? "",
    description: raw.description,
    content: raw.content,
    imageUrl: raw.image,
    sourceName,
    sourceUrl: sourceUrl || undefined,
    articleUrl: raw.url,
    author: raw.author,
    publishedAt: raw.publishedAt,
    category: "top",
  });
}

export class GNewsProvider implements NewsProvider {
  readonly name = "gnews";

  private get apiKey(): string {
    return env.providers.gnews.apiKey;
  }

  private get enabled(): boolean {
    return env.providers.gnews.enabled && this.apiKey.length > 0;
  }

  async getTopNews(params: NewsQuery = {}): Promise<NewsArticle[]> {
    if (!this.enabled) return [];
    const limit = params.pageSize ?? 20;
    const country = params.country ? `&country=${encodeURIComponent(params.country)}` : "";
    const language = params.language ? `&lang=${encodeURIComponent(params.language)}` : "";
    const path = `/top-headlines?category=general&max=${limit}&apikey=${this.apiKey}${country}${language}`;
    const data = await fetchJson(path);
    logger.debug("GNews top news fetched", { count: data.articles?.length ?? 0 });
    return (data.articles ?? []).map(map);
  }

  async getCategoryNews(category: string, params: NewsQuery = {}): Promise<NewsArticle[]> {
    if (!this.enabled) return [];
    const providerCategory = toProviderCategory(category, this.name);
    const limit = params.pageSize ?? 15;
    const country = params.country ? `&country=${encodeURIComponent(params.country)}` : "";
    const language = params.language ? `&lang=${encodeURIComponent(params.language)}` : "";
    const path = `/top-headlines?category=${providerCategory}&max=${limit}&apikey=${this.apiKey}${country}${language}`;
    const data = await fetchJson(path);
    logger.debug("GNews category news fetched", { category, count: data.articles?.length ?? 0 });
    return (data.articles ?? []).map(map);
  }

  async searchNews(query: string, params: NewsQuery = {}): Promise<NewsArticle[]> {
    if (!this.enabled || !query.trim()) return [];
    const limit = params.pageSize ?? 15;
    const category = params.category
      ? `&category=${toProviderCategory(params.category, this.name)}`
      : "";
    const language = params.language ? `&lang=${encodeURIComponent(params.language)}` : "";
    const from = params.from ? `&from=${encodeURIComponent(params.from)}` : "";
    const to = params.to ? `&to=${encodeURIComponent(params.to)}` : "";
    const path = `/search?q=${encodeURIComponent(query.trim())}&max=${limit}${category}${language}${from}${to}&apikey=${this.apiKey}`;
    const data = await fetchJson(path);
    logger.debug("GNews search fetched", { query, count: data.articles?.length ?? 0 });
    return (data.articles ?? []).map(map);
  }
}