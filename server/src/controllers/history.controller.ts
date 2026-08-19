import type { Request, Response } from "express";
import { z } from "zod";
import { historyService } from "../services/history.service.js";
import { personalizationService } from "../services/personalization.service.js";
import { preferenceService } from "../services/preference.service.js";
import { bookmarkService } from "../services/bookmark.service.js";
import { newsService } from "../services/news/newsService.js";
import { AppError } from "../utils/errors.js";
import { fail, ok } from "../utils/response.js";

export const recordHistorySchema = z.object({
  articleId: z.string().trim().min(1).max(200),
  category: z.string().trim().max(80).nullable().optional(),
  source: z.string().trim().max(200).nullable().optional(),
});

export async function getHistoryController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    fail(res, 401, "UNAUTHORIZED", "Please sign in.");
    return;
  }
  try {
    const limit = Number.parseInt(String(req.query["limit"] ?? "50"), 10);
    const history = await historyService.list(req.user.id, Math.min(limit, 200));
    ok(res, { history });
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to load history.");
  }
}

export async function recordHistoryController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    ok(res, { recorded: false });
    return;
  }
  const input = req.body as z.infer<typeof recordHistorySchema>;
  try {
    await historyService.record(req.user.id, input);
    ok(res, { recorded: true });
  } catch {
    ok(res, { recorded: false });
  }
}

export async function clearHistoryController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    fail(res, 401, "UNAUTHORIZED", "Please sign in.");
    return;
  }
  try {
    await historyService.clear(req.user.id);
    ok(res, { cleared: true });
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to clear history.");
  }
}

export async function forYouController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    fail(res, 401, "UNAUTHORIZED", "Please sign in to use your feed.");
    return;
  }

  try {
    const [preferred, history, bookmarks, pool] = await Promise.all([
      preferenceService.list(req.user.id),
      historyService.list(req.user.id, 100),
      bookmarkService.list(req.user.id),
      newsService.getTopNews({ pageSize: 60 }),
    ]);

    const signals = personalizationService.buildSignals(
      preferred,
      history,
      // Bookmark rows don't store a category; the feed's bookmark signal
      // therefore has no category signal to contribute today.
      bookmarks.map(() => ({ category: null as string | null })),
    );

    let ranked = personalizationService.rank(pool, signals);

    // If the user has expressed interest but nothing matched, blend in
    // top stories so the feed is never empty.
    if (preferred.length > 0 && ranked.length === 0) {
      ranked = pool;
    }

    ok(res, {
      articles: ranked.slice(0, 40),
      preferred,
      signals,
    });
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 502, "NEWS_PROVIDER_ERROR", "Unable to build your feed right now.");
  }
}