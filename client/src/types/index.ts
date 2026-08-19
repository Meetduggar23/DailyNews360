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
  tags?: string[];
}

export interface Bookmark {
  id: string;
  articleId: string;
  articleUrl: string;
  title: string;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  error: null;
}

export interface ApiErrorBody {
  success: false;
  data: null;
  error: { code: string; message: string; details?: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export interface PagedNews {
  articles: NewsArticle[];
  total: number;
  hasMore: boolean;
  label?: string;
  query?: string;
}

export interface ArticleDetail {
  article: NewsArticle;
  related: NewsArticle[];
  coverage?: NewsArticle[];
}

export interface Source {
  name: string;
  provider: string;
  url: string;
}

export interface HistoryEntry {
  articleId: string;
  category: string | null;
  source: string | null;
  viewedAt: string;
}

export interface PreferencesResponse {
  categories: string[];
}

export interface FeedResponse {
  articles: NewsArticle[];
  preferred: string[];
  signals: {
    preferredCategories: string[];
    readingCategories: string[];
    bookmarkedCategories: string[];
    sources: string[];
  };
}

export interface LocalBookmark {
  articleId: string;
  articleUrl: string;
  title: string;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string | null;
  savedAt: string;
}

export interface StoryCluster {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  sourceName: string;
  publishedAt: string;
  articleCount: number;
  sources: string[];
  articles: NewsArticle[];
}