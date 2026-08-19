export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  sourceName: string;
  sourceUrl: string;
  articleUrl: string;
  author: string | null;
  publishedAt: string;
  category: string;
  country: string | null;
  language: string | null;
  provider: string;
}

export interface NewsQuery {
  category?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  country?: string;
  language?: string;
  from?: string;
  to?: string;
  sources?: string;
  sort?: SortOption;
}

export interface NewsProvider {
  readonly name: string;
  getTopNews(params?: NewsQuery): Promise<NewsArticle[]>;
  getCategoryNews(category: string, params?: NewsQuery): Promise<NewsArticle[]>;
  searchNews(query: string, params?: NewsQuery): Promise<NewsArticle[]>;
}

export interface PagedNewsResult {
  articles: NewsArticle[];
  total: number;
  hasMore: boolean;
}

export type SortOption = "latest" | "relevance" | "popular";

export const CATEGORIES = [
  "top",
  "technology",
  "business",
  "sports",
  "entertainment",
  "health",
  "science",
  "world",
  "india",
  "politics",
  "trending",
] as const;

export type CategorySlug = (typeof CATEGORIES)[number];