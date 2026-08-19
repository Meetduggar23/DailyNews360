import { getPrisma, isDatabaseAvailable } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import type { Bookmark } from "@prisma/client";

export interface BookmarkInput {
  articleId: string;
  articleUrl: string;
  title: string;
  imageUrl?: string | null;
  sourceName: string;
  publishedAt?: string | null;
}

export class BookmarkService {
  async list(userId: string): Promise<Bookmark[]> {
    if (!(await isDatabaseAvailable())) throw AppError.dbUnavailable();
    return getPrisma().bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async add(userId: string, input: BookmarkInput): Promise<Bookmark> {
    if (!(await isDatabaseAvailable())) throw AppError.dbUnavailable();
    const existing = await getPrisma().bookmark.findUnique({
      where: { userId_articleId: { userId, articleId: input.articleId } },
    });
    if (existing) return existing; // idempotent - no duplicates

    return getPrisma().bookmark.create({
      data: {
        userId,
        articleId: input.articleId,
        articleUrl: input.articleUrl,
        title: input.title,
        imageUrl: input.imageUrl ?? null,
        sourceName: input.sourceName,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      },
    });
  }

  async remove(userId: string, articleId: string): Promise<boolean> {
    if (!(await isDatabaseAvailable())) throw AppError.dbUnavailable();
    const result = await getPrisma().bookmark.deleteMany({
      where: { userId, articleId },
    });
    return result.count > 0;
  }
}

export const bookmarkService = new BookmarkService();