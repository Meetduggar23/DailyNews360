import type {
  ApiResponse,
  ArticleDetail,
  Bookmark,
  FeedResponse,
  HistoryEntry,
  NewsArticle,
  PagedNews,
  PreferencesResponse,
  Source,
  User,
} from "@/types";

const API_BASE = "/api";

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError("Unexpected server response.", "NETWORK_ERROR", response.status);
  }

  if (!payload.success) {
    throw new ApiClientError(
      payload.error?.message ?? "Something went wrong.",
      payload.error?.code ?? "INTERNAL_ERROR",
      response.status,
    );
  }

  return payload.data;
}

export const api = {
  // ---- Auth ----
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User }>("/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User }>("/auth/login", { method: "POST", body: data }),

  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: User | null }>("/auth/me"),

  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    request<{ user: User }>("/auth/profile", { method: "PUT", body: data }),

  // ---- News ----
  topNews: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    });
    return request<{ articles: NewsArticle[] }>(`/news/top${qs.size ? `?${qs}` : ""}`);
  },

  categoryNews: (
    category: string,
    params: Record<string, string | number | undefined> = {},
  ) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    });
    return request<PagedNews>(
      `/news/category/${category}${qs.size ? `?${qs}` : ""}`,
    );
  },

  searchNews: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    });
    return request<PagedNews>(`/news/search${qs.size ? `?${qs}` : ""}`);
  },

  trending: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    });
    return request<{ articles: NewsArticle[] }>(
      `/news/trending${qs.size ? `?${qs}` : ""}`,
    );
  },

  article: (id: string) => request<ArticleDetail>(`/news/${id}`),

  sources: () =>
    request<{ sources: Source[]; providers: Array<{ name: string; requiresKey: boolean }> }>(
      "/news/sources",
    ),

  // ---- Bookmarks ----
  bookmarks: () => request<{ bookmarks: Bookmark[] }>("/bookmarks"),

  addBookmark: (data: {
    articleId: string;
    articleUrl: string;
    title: string;
    imageUrl?: string | null;
    sourceName: string;
    publishedAt?: string | null;
  }) => request<{ bookmark: Bookmark }>("/bookmarks", { method: "POST", body: data }),

  removeBookmark: (articleId: string) =>
    request<{ removed: boolean }>(`/bookmarks/${encodeURIComponent(articleId)}`, {
      method: "DELETE",
    }),

  // ---- Preferences ----
  preferences: () => request<PreferencesResponse>("/preferences"),

  updatePreferences: (categories: string[]) =>
    request<{ categories: string[] }>("/preferences", {
      method: "PUT",
      body: { categories },
    }),

  // ---- History ----
  history: (limit = 50) => request<{ history: HistoryEntry[] }>(`/history?limit=${limit}`),

  recordHistory: (data: { articleId: string; category?: string | null; source?: string | null }) =>
    request<{ recorded: boolean }>("/history", { method: "POST", body: data }),

  clearHistory: () => request<{ cleared: boolean }>("/history", { method: "DELETE" }),

  // ---- Personalized feed ----
  feed: () => request<FeedResponse>("/history/feed"),
};