import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { disconnectDatabase } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`DailyNews360 API listening on http://localhost:${env.port}`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down...`);
  server.close();
  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));