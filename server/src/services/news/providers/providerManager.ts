import { logger } from "../../../lib/logger.js";
import { env } from "../../../config/env.js";
import type { NewsArticle, NewsProvider, NewsQuery } from "../types.js";
import { CurrentsProvider } from "./currents.provider.js";
import { GNewsProvider } from "./gnews.provider.js";
import { MockNewsProvider } from "./mock.provider.js";
import { NoozraProvider } from "./noozra.provider.js";

/**
 * NewsProviderManager
 *
 * Wraps the ordered list of provider adapters and implements fallback logic:
 *
 *   Provider A -> fails? -> Provider B -> fails? -> Provider C -> ... -> [] 
 *
 * A provider that returned 429 Too Many Requests is put on a short backoff
 * cooldown so we never hammer it in a loop. Provider errors are logged but
 * never crash the request pipeline.
 */

type FetchFn = (provider: NewsProvider, params?: NewsQuery) => Promise<NewsArticle[]>;

const RATE_LIMIT_COOLDOWN_MS = 60_000;

interface ProviderState {
  provider: NewsProvider;
  cooldownUntil: number;
}

function buildProviders(): NewsProvider[] {
  if (env.useMockNews) {
    logger.warn("USE_MOCK_NEWS is enabled - serving mock data. DEV ONLY.");
    return [new MockNewsProvider()];
  }
  const providers: NewsProvider[] = [];
  if (env.providers.noozra.enabled) providers.push(new NoozraProvider());
  if (env.providers.gnews.enabled) providers.push(new GNewsProvider());
  if (env.providers.currents.enabled) providers.push(new CurrentsProvider());
  return providers;
}

class ProviderManager {
  private states: ProviderState[];

  constructor(providers: NewsProvider[]) {
    this.states = providers.map((provider) => ({
      provider,
      cooldownUntil: 0,
    }));
  }

  get availableProviders(): NewsProvider[] {
    return this.states.map((state) => state.provider);
  }

  async fetchWithFallback(fetchFn: FetchFn, params?: NewsQuery): Promise<NewsArticle[]> {
    const errors: string[] = [];

    for (const state of this.states) {
      if (Date.now() < state.cooldownUntil) {
        logger.debug("Provider on rate-limit cooldown, skipping", {
          provider: state.provider.name,
        });
        continue;
      }

      const startedAt = Date.now();
      try {
        const articles = await fetchFn(state.provider, params);
        logger.debug("Provider fetch succeeded", {
          provider: state.provider.name,
          count: articles.length,
          latencyMs: Date.now() - startedAt,
        });
        if (articles.length > 0) return articles;
        errors.push(`${state.provider.name}: empty result`);
        continue;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn("Provider fetch failed", {
          provider: state.provider.name,
          error: message,
          latencyMs: Date.now() - startedAt,
        });

        if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
          state.cooldownUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
          logger.warn("Provider rate limited, entering cooldown", {
            provider: state.provider.name,
          });
        }

        errors.push(`${state.provider.name}: ${message}`);
      }
    }

    if (errors.length > 0) {
      logger.error("All news providers failed", { errors });
    }
    return [];
  }

  async getTopNews(params?: NewsQuery): Promise<NewsArticle[]> {
    return this.fetchWithFallback((provider, p) => provider.getTopNews(p), params);
  }

  async getCategoryNews(category: string, params?: NewsQuery): Promise<NewsArticle[]> {
    return this.fetchWithFallback((provider, p) => provider.getCategoryNews(category, p), params);
  }

  async searchNews(query: string, params?: NewsQuery): Promise<NewsArticle[]> {
    return this.fetchWithFallback((provider, p) => provider.searchNews(query, p), params);
  }
}

export const providerManager = new ProviderManager(buildProviders());

export function resetProviderManager(): void {
  (providerManager as unknown as { states: ProviderState[] }).states = buildProviders().map(
    (provider) => ({ provider, cooldownUntil: 0 }),
  );
}