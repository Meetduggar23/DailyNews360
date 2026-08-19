import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function bool(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

function int(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const env = {
  port: int("PORT", 5000),
  nodeEnv: required("NODE_ENV", "development"),
  clientUrl: required("CLIENT_URL", "http://localhost:5173"),
  databaseUrl: required(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/dailynews360?schema=public",
  ),
  jwtSecret: required("JWT_SECRET", "dev-insecure-secret-change-me"),
  authCookieName: required("AUTH_COOKIE_NAME", "dn360_session"),
  isProduction: required("NODE_ENV", "development") === "production",

  providers: {
    noozra: {
      enabled: bool("NEWS_PROVIDER_NOOZRA_ENABLED", true),
      baseUrl: required("NEWS_PROVIDER_NOOZRA_URL", "https://noozra.com"),
    },
    gnews: {
      enabled: bool("NEWS_PROVIDER_GNEWS_ENABLED", true),
      apiKey: process.env["NEWS_PROVIDER_GNEWS_API_KEY"] ?? "",
    },
    currents: {
      enabled: bool("NEWS_PROVIDER_CURRENTS_ENABLED", false),
      apiKey: process.env["NEWS_PROVIDER_CURRENTS_API_KEY"] ?? "",
    },
  },

  useMockNews: bool("USE_MOCK_NEWS", false),

  cacheTtl: {
    top: int("NEWS_CACHE_TTL_TOP", 600),
    category: int("NEWS_CACHE_TTL_CATEGORY", 600),
    search: int("NEWS_CACHE_TTL_SEARCH", 300),
  },
} as const;

export type Env = typeof env;