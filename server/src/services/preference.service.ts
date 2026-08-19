import { getPrisma, isDatabaseAvailable } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import type { UserPreference } from "@prisma/client";

export class PreferenceService {
  async list(userId: string): Promise<string[]> {
    if (!(await isDatabaseAvailable())) throw AppError.dbUnavailable();
    const rows = await getPrisma().userPreference.findMany({ where: { userId } });
    return rows.map((row) => row.category);
  }

  async replace(userId: string, categories: string[]): Promise<string[]> {
    if (!(await isDatabaseAvailable())) throw AppError.dbUnavailable();
    const prisma = getPrisma();

    const unique = [...new Set(categories.map((c) => c.toLowerCase()))];

    await prisma.$transaction([
      prisma.userPreference.deleteMany({ where: { userId } }),
      ...unique.map((category) =>
        prisma.userPreference.create({ data: { userId, category } }),
      ),
    ]);

    return unique;
  }
}

export type PreferenceRow = UserPreference;

export const preferenceService = new PreferenceService();