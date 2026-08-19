import { env } from "../../../config/env.js";
import { logger } from "../../../lib/logger.js";
import { toProviderCategory } from "../categoryMap.js";
import { normalizeArticle } from "../normalizer.js";
import type { NewsArticle, NewsProvider, NewsQuery } from "../types.js";

interface CurrentsArticle {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  author?: string;
  published?: string;
  category?: string[];
  country?: string;
  language?: string;
  source?: string;
}

interface CurrentsResponse {
  news?: CurrentsArticle[];
  status?: string;
  message?: string;
}

const REQUEST_TIMEOUT_MS = 10_000;
const BASE_URL = "https://api.currentsapi.services/v1";

async function fetchJson(path: string): Promise<CurrentsResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
    if (res.status === 429) {
      throw new Error("Currents API rate limited (429)");
    }
    if (!res.ok) {
      throw new Error(`Currents request failed with status ${res.status}`);
    }
    return (await res.json()) as CurrentsResponse;
  } finally {
    clearTimeout(timeout);
  }
}

function map(raw: CurrentsArticle): NewsArticle {
  return normalizeArticle({
    provider: "currents",
    rawId: raw.id,
    title: raw.title ?? "",
    description: raw.description,
    content: raw.content,
    imageUrl: raw.image,
    sourceName: raw.source,
    articleUrl: raw.url,
    author: raw.author,
    publishedAt: raw.published,
    category: raw.category?.[0],
    country: raw.country,
    language: raw.language,
  });
}

export class CurrentsProvider implements NewsProvider {
  readonly name = "currents";

  private get apiKey(): string {
    return env.providers.currents.apiKey;
  }

  private get enabled(): boolean {
    return env.providers.currents.enabled && this.apiKey.length > 0;
  }

  async getTopNews(params: NewsQuery = {}): Promise<NewsArticle[]> {
    if (!this.enabled) return [];
    const limit = params.pageSize ?? 20;
    const path = `/latest-news?language=en&page_size=${limit}&apiKey=${this.apiKey}`;
    const data = await fetchJson(path);
    logger.debug("Currents top news fetched", { count: data.news?.length ?? 0 });
    return (data.news ?? []).map(map);
  }

  async getCategoryNews(category: string, params: NewsQuery = {}): Promise<NewsArticle[]> {
    if (!this.enabled) return [];
    const providerCategory = toProviderCategory(category, this.name);
    const limit = params.pageSize ?? 15;
    const path = `/latest-news?language=en&category=${providerCategory}&page_size=${limit}&apiKey=${this.apiKey}`;
    const data = await fetchJson(path);
    logger.debug("Currents category news fetched", { category, count: data.news?.length ?? 0 });
    return (data.news ?? []).map(map);
  }

  async searchNews(query: string, params: NewsQuery = {}): Promise<NewsArticle[]> {
    if (!this.enabled || !query.trim()) return [];
    const limit = params.pageSize ?? 15;
    const path = `/search?language=en&keywords=${encodeURIComponent(query.trim())}&page_size=${limit}&apiKey=${this.apiKey}`;
    const data = await fetchJson(path);
    logger.debug("Currents search fetched", { query, count: data.news?.length ?? 0 });
    return (data.news ?? []).map(map);
  }
}