import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { getPrisma, isDatabaseAvailable } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { AppError } from "../utils/errors.js";
import type { User } from "@prisma/client";

const SALT_ROUNDS = 12;
const SESSION_DAYS = 7;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

function signToken(user: SessionUser): string {
  return jwt.sign({ sub: user.id, name: user.name, email: user.email }, env.jwtSecret, {
    expiresIn: `${SESSION_DAYS}d`,
    issuer: "dailynews360",
    audience: "dailynews360-web",
  });
}

export function setSessionCookie(res: Response, user: SessionUser): void {
  const token = signToken(user);
  res.cookie(env.authCookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(env.authCookieName, { path: "/" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: "dailynews360",
      audience: "dailynews360-web",
    }) as jwt.JwtPayload;
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: payload.name ?? "",
      email: payload.email ?? "",
    };
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: Request): SessionUser | null {
  const token = req.cookies?.[env.authCookieName];
  if (!token || typeof token !== "string") return null;
  return verifyToken(token);
}

export function toSessionUser(user: User): SessionUser {
  return { id: user.id, name: user.name, email: user.email };
}

export class AuthService {
  async register(name: string, email: string, password: string): Promise<SessionUser> {
    if (!(await isDatabaseAvailable())) {
      throw AppError.dbUnavailable();
    }

    const prisma = getPrisma();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw AppError.conflict("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });
    logger.info("User registered", { userId: user.id });
    return toSessionUser(user);
  }

  async login(email: string, password: string): Promise<SessionUser> {
    if (!(await isDatabaseAvailable())) {
      throw AppError.dbUnavailable();
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw AppError.unauthorized("Invalid email or password.");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      logger.warn("Failed login attempt", { email });
      throw AppError.unauthorized("Invalid email or password.");
    }

    logger.info("User logged in", { userId: user.id });
    return toSessionUser(user);
  }

  async getProfile(userId: string): Promise<User | null> {
    if (!(await isDatabaseAvailable())) return null;
    return getPrisma().user.findUnique({ where: { id: userId } });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string; password?: string },
  ): Promise<SessionUser> {
    if (!(await isDatabaseAvailable())) {
      throw AppError.dbUnavailable();
    }

    const update: { name?: string; email?: string; passwordHash?: string } = {};
    if (data.name) update.name = data.name;
    if (data.email) {
      const existing = await getPrisma().user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        throw AppError.conflict("An account with this email already exists.");
      }
      update.email = data.email;
    }
    if (data.password) {
      update.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const user = await getPrisma().user.update({
      where: { id: userId },
      data: update,
    });
    return toSessionUser(user);
  }
}

export const authService = new AuthService();