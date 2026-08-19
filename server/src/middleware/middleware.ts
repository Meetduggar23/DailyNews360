import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { fail } from "../utils/response.js";

/** Global API limiter - protects the server from abuse. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    fail(res, 429, "RATE_LIMITED", "Too many requests. Please slow down.");
  },
});

/** Stricter limiter for auth endpoints. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    fail(res, 429, "RATE_LIMITED", "Too many attempts. Please try again later.");
  },
});

/** Optional safe limiter for the news endpoints (cached heavily anyway). */
export const newsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    fail(res, 429, "RATE_LIMITED", "Too many requests. Please slow down.");
  },
});

export function notFoundHandler(_req: Request, res: Response): void {
  fail(res, 404, "NOT_FOUND", "Route not found.");
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    fail(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected error.";
  if (env.nodeEnv === "development") {
    // eslint-disable-next-line no-console
    console.error(message);
  }
  fail(res, 500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}