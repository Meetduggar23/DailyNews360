import { describe, expect, it } from "vitest";
import { deduplicateArticles, deduplicateBySource } from "./dedupe.js";
import { makeArticle } from "./test-fixtures.js";

describe("deduplicateArticles", () => {
  it("removes exact duplicates by fingerprint", () => {
    const first = makeArticle({ title: "Exact same headline" });
    const second = makeArticle({
      title: "Exact same headline",
      articleUrl: first.articleUrl,
      sourceName: "Same",
    });
    const result = deduplicateArticles([first, second]);
    expect(result).toHaveLength(1);
  });

  it("collapses near-identical headlines above the threshold", () => {
    const a = makeArticle({ title: "Heatwave grips the capital city this week" });
    const b = makeArticle({ title: "Heatwave grips the capital city this week!" });
    expect(deduplicateArticles([a, b])).toHaveLength(1);
  });

  it("keeps distinct stories", () => {
    const a = makeArticle({ title: "RBI keeps interest rates unchanged" });
    const b = makeArticle({ title: "New smartphone launches next month" });
    expect(deduplicateArticles([a, b])).toHaveLength(2);
  });
});

describe("deduplicateBySource", () => {
  it("keeps the newest story per source per story", () => {
    const shared = "Company posts record quarterly profit";
    const url = "https://example.com/stories/profit";
    const older = makeArticle({
      title: shared,
      sourceName: "NewsWire",
      articleUrl: url,
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    });
    const newer = makeArticle({
      title: shared,
      sourceName: "NewsWire",
      articleUrl: url,
      publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    });
    const result = deduplicateBySource([older, newer]);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(newer.id);
  });

  it("keeps stories from different sources", () => {
    const a = makeArticle({ title: "Shared story", sourceName: "Alpha" });
    const b = makeArticle({ title: "Shared story", sourceName: "Beta" });
    expect(deduplicateBySource([a, b])).toHaveLength(2);
  });
});