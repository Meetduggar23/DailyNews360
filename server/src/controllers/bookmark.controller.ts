import type { Request, Response } from "express";
import { z } from "zod";
import { bookmarkService } from "../services/bookmark.service.js";
import { AppError } from "../utils/errors.js";
import { fail, ok } from "../utils/response.js";

export const addBookmarkSchema = z.object({
  articleId: z.string().trim().min(1).max(200),
  articleUrl: z.string().url(),
  title: z.string().trim().min(1).max(500),
  imageUrl: z.string().url().nullable().optional(),
  sourceName: z.string().trim().min(1).max(200),
  publishedAt: z.string().nullable().optional(),
});

export async function listBookmarksController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    fail(res, 401, "UNAUTHORIZED", "Please sign in to view bookmarks.");
    return;
  }
  try {
    const bookmarks = await bookmarkService.list(req.user.id);
    ok(res, { bookmarks });
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to load bookmarks.");
  }
}

export async function addBookmarkController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    fail(res, 401, "UNAUTHORIZED", "Please sign in to bookmark stories.");
    return;
  }
  const input = req.body as z.infer<typeof addBookmarkSchema>;
  try {
    const bookmark = await bookmarkService.add(req.user.id, input);
    ok(res, { bookmark }, 201);
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to save bookmark.");
  }
}

export async function removeBookmarkController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    fail(res, 401, "UNAUTHORIZED", "Please sign in.");
    return;
  }
  const articleId = String(req.params["articleId"] ?? "");
  try {
    const removed = await bookmarkService.remove(req.user.id, articleId);
    ok(res, { removed });
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to remove bookmark.");
  }
}