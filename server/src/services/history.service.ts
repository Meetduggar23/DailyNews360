import { getPrisma, isDatabaseAvailable } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

export interface HistoryInput {
  articleId: string;
  category?: string | null;
  source?: string | null;
}

export class HistoryService {
  async list(userId: string, limit = 50): Promise<Array<{ articleId: string; category: string | null; source: string | null; viewedAt: Date }>> {
    if (!(await isDatabaseAvailable())) throw AppError.dbUnavailable();
    const rows = await getPrisma().readingHistory.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      take: limit,
    });
    return rows.map((row) => ({
      articleId: row.articleId,
      category: row.category,
      source: row.source,
      viewedAt: row.viewedAt,
    }));
  }

  async record(userId: string, input: HistoryInput): Promise<void> {
    if (!(await isDatabaseAvailable())) return; // non-critical, degrade silently
    const prisma = getPrisma();
    const existing = await prisma.readingHistory.findUnique({
      where: { userId_articleId: { userId, articleId: input.articleId } },
    });

    if (existing) {
      await prisma.readingHistory.update({
        where: { id: existing.id },
        data: { category: input.category ?? existing.category, source: input.source ?? existing.source, viewedAt: new Date() },
      });
      return;
    }

    await prisma.readingHistory.create({
      data: {
        userId,
        articleId: input.articleId,
        category: input.category ?? null,
        source: input.source ?? null,
      },
    });
  }

  async clear(userId: string): Promise<void> {
    if (!(await isDatabaseAvailable())) throw AppError.dbUnavailable();
    await getPrisma().readingHistory.deleteMany({ where: { userId } });
  }
}

export const historyService = new HistoryService();