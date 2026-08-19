import type { NextFunction, Request, Response } from "express";
import { getUserFromRequest } from "../services/auth.service.js";
import { AppError } from "../utils/errors.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const user = getUserFromRequest(req);
  if (!user) {
    next(AppError.unauthorized("Please sign in to continue."));
    return;
  }
  req.user = user;
  next();
}

/** Optional auth - attaches the user when a valid session exists. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const user = getUserFromRequest(req);
  if (user) req.user = user;
  next();
}