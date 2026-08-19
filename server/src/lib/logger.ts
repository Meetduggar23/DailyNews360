type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel: LogLevel =
  process.env["LOG_LEVEL"] === "debug" ? "debug" : "info";

function ts(): string {
  return new Date().toISOString();
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[currentLevel]) return;
  const line = {
    time: ts(),
    level,
    message,
    ...meta,
  };
  if (level === "error") {
    console.error(JSON.stringify(line));
  } else {
    console.log(JSON.stringify(line));
  }
}

function safeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const clone = { ...meta };
  for (const key of Object.keys(clone)) {
    const value = clone[key];
    if (
      typeof value === "string" &&
      /(password|secret|token|apikey|api_key|authorization|cookie)/i.test(key)
    ) {
      clone[key] = "[REDACTED]";
    }
  }
  return clone;
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) =>
    emit("debug", message, safeMeta(meta)),
  info: (message: string, meta?: Record<string, unknown>) =>
    emit("info", message, safeMeta(meta)),
  warn: (message: string, meta?: Record<string, unknown>) =>
    emit("warn", message, safeMeta(meta)),
  error: (message: string, meta?: Record<string, unknown>) =>
    emit("error", message, safeMeta(meta)),
};