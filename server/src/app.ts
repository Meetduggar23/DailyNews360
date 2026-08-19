import express from "express";
import type { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { apiLimiter, errorHandler, notFoundHandler } from "./middleware/middleware.js";
import { logger } from "./lib/logger.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/api", apiLimiter);
  app.use("/api", routes);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "dailynews360", time: new Date().toISOString() });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  logger.info("Express app created", { env: env.nodeEnv, clientUrl: env.clientUrl });

  return app;
}