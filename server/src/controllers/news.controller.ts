import type { Request, Response } from "express";
import { z } from "zod";
import { newsService } from "../services/news/newsService.js";
import { preferenceService } from "../services/preference.service.js";
import { historyService } from "../services/history.service.js";
import { CATEGORIES } from "../services/news/types.js";
import type { NewsQuery, SortOption } from "../services/news/types.js";
import { fail, ok } from "../utils/response.js";

const pageSizeSchema = z.coerce.number().int().min(1).max(50).default(15);
const pageSchema = z.coerce.number().int().min(1).max(200).default(1);

/** Parses a numeric query param without throwing, so bad input never crashes the process. */
function safeParse<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

async function userSignals(req: Request) {
  if (!req.user) return undefined;
  try {
    const [categories] = await Promise.all([
      preferenceService.list(req.user.id),
    ]);
    return {
      categories,
      bookmarkedCategories: [],
    };
  } catch {
    return undefined;
  }
}

export async function topNewsController(req: Request, res: Response): Promise<void> {
  const pageSize = safeParse(pageSizeSchema, req.query["pageSize"], 15);
  const q = req.query["q"] ? String(req.query["q"]) : undefined;
  const query = {
    pageSize,
    country: req.query["country"] ? String(req.query["country"]) : undefined,
    language: req.query["language"] ? String(req.query["language"]) : undefined,
    q,
  };
  try {
    const articles = await newsService.getTopNews(query, await userSignals(req));
    ok(res, { articles });
  } catch {
    fail(res, 502, "NEWS_PROVIDER_ERROR", "Unable to fetch news right now.");
  }
}

export async function categoryNewsController(req: Request, res: Response): Promise<void> {
  const category = String(req.params["category"] ?? "").toLowerCase();
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    fail(res, 400, "VALIDATION_ERROR", `Unknown category: ${category}`);
    return;
  }
  const pageSize = safeParse(pageSizeSchema, req.query["pageSize"], 15);
  const page = safeParse(pageSchema, req.query["page"], 1);
  const sortRaw = req.query["sort"] ? String(req.query["sort"]) : "latest";
  const sort: SortOption = ["latest", "relevance", "popular"].includes(sortRaw)
    ? (sortRaw as SortOption)
    : "latest";
  const query: NewsQuery = {
    pageSize,
    page,
    country: req.query["country"] ? String(req.query["country"]) : undefined,
    language: req.query["language"] ? String(req.query["language"]) : undefined,
    sort,
  };
  try {
    const result = await newsService.getCategoryNews(category, query, await userSignals(req));
    ok(res, {
      articles: result.articles,
      total: result.total,
      hasMore: result.hasMore,
      category,
      label: newsService.getCategoryLabel(category),
    });
  } catch {
    fail(res, 502, "NEWS_PROVIDER_ERROR", "Unable to fetch news right now.");
  }
}

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  pageSize: pageSizeSchema,
  category: z.string().optional(),
  sources: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.enum(["latest", "relevance", "popular"]).default("relevance"),
});

export async function searchNewsController(req: Request, res: Response): Promise<void> {
  const parsed = searchQuerySchema.parse(req.query);
  try {
    const result = await newsService.searchNews(
      {
        q: parsed.q,
        pageSize: parsed.pageSize,
        category: parsed.category,
        sources: parsed.sources,
        from: parsed.from,
        to: parsed.to,
        sort: parsed.sort,
      },
      await userSignals(req),
    );
    ok(res, {
      articles: result.articles,
      total: result.total,
      hasMore: result.hasMore,
      query: parsed.q,
    });
  } catch {
    fail(res, 502, "NEWS_PROVIDER_ERROR", "Unable to search news right now.");
  }
}

export async function trendingController(req: Request, res: Response): Promise<void> {
  const pageSize = pageSizeSchema.parse(req.query["pageSize"] ?? 10);
  try {
    const articles = await newsService.getTrending({ pageSize }, await userSignals(req));
    ok(res, { articles });
  } catch {
    fail(res, 502, "NEWS_PROVIDER_ERROR", "Unable to fetch trending stories right now.");
  }
}

export async function mostReadController(req: Request, res: Response): Promise<void> {
  const pageSize = pageSizeSchema.parse(req.query["pageSize"] ?? 6);
  try {
    const articles = await newsService.getMostRead({ pageSize }, await userSignals(req));
    ok(res, { articles });
  } catch {
    fail(res, 502, "NEWS_PROVIDER_ERROR", "Unable to fetch most-read stories right now.");
  }
}

export async function articleController(req: Request, res: Response): Promise<void> {
  const id = String(req.params["id"] ?? "");
  try {
    const article = await newsService.getArticleById(id);
    if (!article) {
      fail(res, 404, "NOT_FOUND", "This story could not be found.");
      return;
    }

    // Record reading history for authenticated users (non-critical).
    if (req.user) {
      void historyService.record(req.user.id, {
        articleId: article.id,
        category: article.category,
        source: article.sourceName,
      });
    }

    const [relatedResult, coverage] = await Promise.all([
      newsService.getCategoryNews(article.category, { pageSize: 6 }),
      newsService.getClusterForArticle(id),
    ]);
    ok(res, {
      article,
      related: relatedResult.articles.filter((a) => a.id !== article.id).slice(0, 4),
      coverage: coverage?.articles ?? [],
    });
  } catch {
    fail(res, 502, "NEWS_PROVIDER_ERROR", "Unable to fetch this story right now.");
  }
}

export async function clustersController(req: Request, res: Response): Promise<void> {
  const pageSize = pageSizeSchema.parse(req.query["pageSize"] ?? 5);
  try {
    const clusters = await newsService.getClusters({ pageSize }, await userSignals(req));
    ok(res, { clusters });
  } catch {
    fail(res, 502, "NEWS_PROVIDER_ERROR", "Unable to build story clusters right now.");
  }
}

export async function sourcesController(_req: Request, res: Response): Promise<void> {
  try {
    const sources = await newsService.getSources();
    const providers = newsService.getConfiguredProviders();
    ok(res, { sources, providers });
  } catch {
    fail(res, 502, "NEWS_PROVIDER_ERROR", "Unable to fetch sources right now.");
  }
}