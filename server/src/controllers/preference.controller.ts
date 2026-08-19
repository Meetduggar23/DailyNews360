import type { Request, Response } from "express";
import { z } from "zod";
import { preferenceService } from "../services/preference.service.js";
import { AppError } from "../utils/errors.js";
import { fail, ok } from "../utils/response.js";

const INTEREST_CATEGORIES = [
  "technology",
  "business",
  "sports",
  "entertainment",
  "health",
  "science",
  "world",
  "india",
  "politics",
];

const updatePreferencesSchema = z.object({
  categories: z
    .array(z.string().trim().min(1).max(50))
    .max(20)
    .refine((categories) => categories.every((c) => INTEREST_CATEGORIES.includes(c)), {
      message: "Unknown interest category.",
    }),
});

export async function getPreferencesController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    fail(res, 401, "UNAUTHORIZED", "Please sign in.");
    return;
  }
  try {
    const categories = await preferenceService.list(req.user.id);
    ok(res, { categories });
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to load preferences.");
  }
}

export async function updatePreferencesController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    fail(res, 401, "UNAUTHORIZED", "Please sign in.");
    return;
  }
  const { categories } = req.body as z.infer<typeof updatePreferencesSchema>;
  try {
    const saved = await preferenceService.replace(req.user.id, categories);
    ok(res, { categories: saved });
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to save preferences.");
  }
}