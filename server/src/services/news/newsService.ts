import { cache, cacheKey } from "../../lib/cache.js";
import { env } from "../../config/env.js";
import { deduplicateArticles, deduplicateBySource } from "./dedupe.js";
import { providerManager } from "./providers/providerManager.js";
import { rankArticles, recordActivity, sortArticles } from "./ranker.js";
import type {
  NewsArticle,
  NewsQuery,
  NewsProvider,
  PagedNewsResult,
  SortOption,
} from "./types.js";
import { categoryLabel } from "./categoryMap.js";

export interface UserSignal {
  categories?: string[];
  bookmarkedCategories?: string[];
}

export class NewsService {
  /** Top stories across all categories. */
  async getTopNews(query: NewsQuery = {}, signal?: UserSignal): Promise<NewsArticle[]> {
    const ttl = env.cacheTtl.top;
    const key = cacheKey("news:top", query.pageSize ?? 20, query.country ?? "", query.language ?? "");
    const cached = cache.get<NewsArticle[]>(key);
    if (cached) return this.decorate(cached, signal);

    const raw = await providerManager.getTopNews(query);
    const articles = this.finalize(raw, signal, query);
    cache.set(key, articles, ttl);
    return articles;
  }

  async getCategoryNews(
    category: string,
    query: NewsQuery = {},
    signal?: UserSignal,
  ): Promise<PagedNewsResult> {
    const ttl = env.cacheTtl.category;
    const key = cacheKey(
      "news:category",
      category,
      query.pageSize ?? 15,
      query.country ?? "",
      query.language ?? "",
    );
    const cached = cache.get<PagedNewsResult>(key);
    if (cached) {
      return {
        articles: this.decorate(cached.articles, signal),
        total: cached.total,
        hasMore: cached.hasMore,
      };
    }

    const raw = await providerManager.getCategoryNews(category, query);
    const deduped = deduplicateArticles(raw);
    const total = deduped.length;
    const articles = this.finalize(deduped, signal, query);
    const result: PagedNewsResult = {
      articles,
      total,
      hasMore: total > (query.pageSize ?? 15),
    };
    cache.set(key, result, ttl);
    return result;
  }

  async searchNews(query: NewsQuery, signal?: UserSignal): Promise<PagedNewsResult> {
    const q = (query.q ?? "").trim();
    if (!q) {
      return { articles: [], total: 0, hasMore: false };
    }

    const ttl = env.cacheTtl.search;
    const key = cacheKey(
      "news:search",
      q,
      query.category ?? "",
      query.sources ?? "",
      query.from ?? "",
      query.to ?? "",
      query.pageSize ?? 15,
    );
    const cached = cache.get<PagedNewsResult>(key);
    if (cached) {
      return {
        articles: this.decorate(cached.articles, signal, query.q),
        total: cached.total,
        hasMore: cached.hasMore,
      };
    }

    const raw = await providerManager.searchNews(q, query);
    const deduped = deduplicateArticles(raw);
    const total = deduped.length;
    const articles = this.finalize(deduped, signal, query);
    const result: PagedNewsResult = {
      articles,
      total,
      hasMore: total > (query.pageSize ?? 15),
    };
    cache.set(key, result, ttl);
    return result;
  }

  /** Trending: recency-weighted ranking over the freshest top news. */
  async getTrending(query: NewsQuery = {}, signal?: UserSignal): Promise<NewsArticle[]> {
    const articles = await this.getTopNews({ ...query, pageSize: Math.max(query.pageSize ?? 15, 20) }, signal);
    recordActivity();
    const ranked = rankArticles(articles, {
      query: query.q,
      userCategories: signal?.categories,
      bookmarkedCategories: signal?.bookmarkedCategories,
    });
    return ranked.slice(0, query.pageSize ?? 10);
  }

  /** Lookup a single article by its normalized id across all cached stories. */
  async getArticleById(id: string): Promise<NewsArticle | null> {
    if (!id) return null;
    const candidates = await this.getTopNews({ pageSize: 60 });
    return candidates.find((article) => article.id === id) ?? null;
  }

  async getSources(): Promise<Array<{ name: string; provider: string; url: string }>> {
    const articles = await this.getTopNews({ pageSize: 50 });
    const byName = new Map<string, { name: string; provider: string; url: string }>();
    for (const article of articles) {
      if (!byName.has(article.sourceName)) {
        byName.set(article.sourceName, {
          name: article.sourceName,
          provider: article.provider,
          url: article.sourceUrl,
        });
      }
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  getConfiguredProviders(): Array<{ name: string; requiresKey: boolean; enabled: boolean }> {
    return providerManager.availableProviders.map((p: NewsProvider) => ({
      name: p.name,
      requiresKey: p.name === "gnews" || p.name === "currents",
      enabled: true,
    }));
  }

  getCategoryLabel(category: string): string {
    return categoryLabel(category);
  }

  /** Dedupe, rank and sort the final output list. */
  private finalize(
    raw: NewsArticle[],
    signal?: UserSignal,
    query: NewsQuery = {},
  ): NewsArticle[] {
    let articles = deduplicateArticles(raw);
    articles = deduplicateBySource(articles);

    if (signal?.categories?.length || signal?.bookmarkedCategories?.length) {
      articles = rankArticles(articles, {
        query: query.q,
        userCategories: signal.categories,
        bookmarkedCategories: signal.bookmarkedCategories,
      });
    } else if (query.q) {
      articles = rankArticles(articles, { query: query.q });
    }

    const sort: SortOption = query.sort as SortOption;
    if (sort && sort !== "relevance") {
      articles = sortArticles(articles, sort);
    }
    return articles;
  }

  /** Apply per-user decoration (e.g. category labels stay canonical). */
  private decorate(articles: NewsArticle[], _signal?: UserSignal, _query?: string): NewsArticle[] {
    // Currently a no-op - kept as a seam for future per-user logic.
    void _signal;
    void _query;
    return articles;
  }
}

export const newsService = new NewsService();

export { categoryLabel } from "./categoryMap.js";
export { logger as newsLogger } from "../../lib/logger.js";