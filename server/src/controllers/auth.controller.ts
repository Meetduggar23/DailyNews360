import type { Request, Response } from "express";
import { z } from "zod";
import {
  authService,
  clearSessionCookie,
  setSessionCookie,
  toSessionUser,
} from "../services/auth.service.js";
import { AppError } from "../utils/errors.js";
import { fail, ok } from "../utils/response.js";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(1, "Password is required.").max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  password: z.string().min(8).max(128).optional(),
});

export async function registerController(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;
  try {
    const user = await authService.register(name, email, password);
    setSessionCookie(res, user);
    ok(res, { user }, 201);
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to create account right now.");
  }
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  try {
    const user = await authService.login(email, password);
    setSessionCookie(res, user);
    ok(res, { user });
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to sign in right now.");
  }
}

export function logoutController(_req: Request, res: Response): void {
  clearSessionCookie(res);
  ok(res, { message: "Signed out." });
}

export async function meController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    ok(res, { user: null });
    return;
  }
  const user = await authService.getProfile(req.user.id);
  if (!user) {
    fail(res, 401, "UNAUTHORIZED", "Session no longer valid.");
    return;
  }
  ok(res, { user: toSessionUser(user) });
}

export async function updateProfileController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    fail(res, 401, "UNAUTHORIZED", "Please sign in.");
    return;
  }
  const data = req.body as z.infer<typeof updateProfileSchema>;
  try {
    const user = await authService.updateProfile(req.user.id, data);
    setSessionCookie(res, user);
    ok(res, { user });
  } catch (err) {
    if (err instanceof AppError) fail(res, err.statusCode, err.code, err.message);
    else fail(res, 500, "INTERNAL_ERROR", "Unable to update profile.");
  }
}