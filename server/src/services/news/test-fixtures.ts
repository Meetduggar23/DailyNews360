import type { NewsArticle } from "./types.js";

let counter = 0;

export function makeArticle(overrides: Partial<NewsArticle> = {}): NewsArticle {
  counter += 1;
  return {
    id: `article-${counter}`,
    title: "Sample story headline about the world",
    description: "A sample description for the sample story.",
    content: null,
    imageUrl: null,
    sourceName: "Source A",
    sourceUrl: "https://example.com/source",
    articleUrl: `https://example.com/stories/${counter}`,
    author: null,
    publishedAt: new Date(Date.now() - counter * 60 * 1000).toISOString(),
    category: "world",
    country: "us",
    language: "en",
    provider: "mock",
    ...overrides,
  };
}