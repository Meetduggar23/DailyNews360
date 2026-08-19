import { env } from "../../../config/env.js";
import { logger } from "../../../lib/logger.js";
import { toProviderCategory } from "../categoryMap.js";
import { normalizeArticle } from "../normalizer.js";
import type { NewsArticle, NewsProvider, NewsQuery } from "../types.js";

interface NoozraArticle {
  id?: string;
  headline?: string;
  title?: string;
  url?: string;
  published_at?: string;
  publishedAt?: string;
  source?: string;
  category?: string;
  image_url?: string;
  imageUrl?: string;
  description?: string;
}

interface NoozraResponse {
  articles: NoozraArticle[];
  count?: number;
}

const REQUEST_TIMEOUT_MS = 10_000;

async function fetchJson(path: string): Promise<NoozraResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${env.providers.noozra.baseUrl}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (res.status === 429) {
      throw new Error("Noozra rate limited (429)");
    }
    if (!res.ok) {
      throw new Error(`Noozra request failed with status ${res.status}`);
    }
    return (await res.json()) as NoozraResponse;
  } finally {
    clearTimeout(timeout);
  }
}

function map(raw: NoozraArticle): NewsArticle {
  const title = raw.headline ?? raw.title ?? "";
  return normalizeArticle({
    provider: "noozra",
    rawId: raw.id,
    title,
    description: raw.description,
    imageUrl: raw.image_url ?? raw.imageUrl,
    sourceName: raw.source,
    articleUrl: raw.url,
    publishedAt: raw.published_at ?? raw.publishedAt,
    category: raw.category,
  });
}

export class NoozraProvider implements NewsProvider {
  readonly name = "noozra";

  private get enabled(): boolean {
    return env.providers.noozra.enabled;
  }

  async getTopNews(params: NewsQuery = {}): Promise<NewsArticle[]> {
    if (!this.enabled) return [];
    const limit = params.pageSize ?? 20;
    const path = `/api/articles?limit=${limit}`;
    const data = await fetchJson(path);
    logger.debug("Noozra top news fetched", { count: data.articles.length });
    return data.articles.map(map);
  }

  async getCategoryNews(category: string, params: NewsQuery = {}): Promise<NewsArticle[]> {
    if (!this.enabled) return [];
    const providerCategory = toProviderCategory(category, this.name);
    const limit = params.pageSize ?? 15;
    const path = `/api/articles?category=${encodeURIComponent(providerCategory)}&limit=${limit}`;
    const data = await fetchJson(path);
    logger.debug("Noozra category news fetched", { category, count: data.articles.length });
    return data.articles.map(map);
  }

  async searchNews(query: string, params: NewsQuery = {}): Promise<NewsArticle[]> {
    if (!this.enabled || !query.trim()) return [];
    const limit = params.pageSize ?? 15;
    const path = `/api/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
    const data = await fetchJson(path);
    logger.debug("Noozra search fetched", { query, count: data.articles.length });
    return data.articles.map(map);
  }
}