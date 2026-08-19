import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEIGHTS,
  MOST_READ_WEIGHTS,
  rankArticles,
  rankByPopularity,
  scoreArticle,
  sortArticles,
  sourcePopularity,
} from "./ranker.js";
import { makeArticle } from "./test-fixtures.js";

/** Finds two source names with a reliably large popularity gap. */
function contrastingSources(): [string, string] {
  for (let i = 0; i < 100; i += 1) {
    const popular = `Bold Popular Outlet ${i}`;
    const minor = `Quiet Local Paper ${i}`;
    if (sourcePopularity(popular) > sourcePopularity(minor) + 0.15) {
      return [popular, minor];
    }
  }
  throw new Error("Could not find contrasting source names");
}

describe("scoreArticle", () => {
  it("scores fresh stories higher than old ones (recency factor)", () => {
    const fresh = makeArticle({
      title: "Breaking news story",
      publishedAt: new Date().toISOString(),
    });
    const old = makeArticle({
      title: "Breaking news story",
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    });
    expect(scoreArticle({ article: fresh })).toBeGreaterThan(scoreArticle({ article: old }));
  });

  it("boosts relevance when the query matches", () => {
    const match = makeArticle({ title: "AI regulation discussed in parliament" });
    const miss = makeArticle({ title: "Cooking tips for the weekend" });
    const withQuery = (article: typeof match) =>
      scoreArticle({ article, query: "AI regulation" });
    expect(withQuery(match)).toBeGreaterThan(withQuery(miss));
  });

  it("boosts user interest when the category is preferred", () => {
    const preferred = makeArticle({ category: "technology" });
    const other = makeArticle({ category: "sports" });
    const scored = (article: typeof preferred) =>
      scoreArticle({ article, userCategories: ["technology"] });
    expect(scored(preferred)).toBeGreaterThan(scored(other));
  });
});

describe("rankArticles", () => {
  it("returns the highest-scoring article first", () => {
    const articles = [
      makeArticle({ title: "Random unrelated headline" }),
      makeArticle({ title: "AI regulation discussed", category: "technology" }),
    ];
    const ranked = rankArticles(articles, { query: "AI regulation" });
    expect(ranked[0]!.title).toContain("AI regulation");
  });

  it("keeps weights configurable without crashing", () => {
    const articles = [makeArticle(), makeArticle()];
    const ranked = rankArticles(articles, {}, { ...DEFAULT_WEIGHTS, popularity: 0.9 });
    expect(ranked).toHaveLength(2);
  });
});

describe("rankByPopularity", () => {
  it("gives the popularity signal the dominant weight", () => {
    expect(MOST_READ_WEIGHTS.popularity).toBeGreaterThan(MOST_READ_WEIGHTS.recency);
    expect(MOST_READ_WEIGHTS.popularity).toBeGreaterThan(MOST_READ_WEIGHTS.userInterest);
  });

  it("promotes a high-popularity older story over a fresh minor one", () => {
    const [popular, minor] = contrastingSources();
    const oldPopular = makeArticle({
      title: "Viral event everyone is talking about",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sourceName: popular,
    });
    const freshMinor = makeArticle({
      title: "Minor local update",
      publishedAt: new Date().toISOString(),
      sourceName: minor,
    });
    const first = rankByPopularity([freshMinor, oldPopular])[0]!;
    expect(first.title).toBe(oldPopular.title);
  });

  it("matches scoreArticle ordering under the Most Read weights", () => {
    const articles = [
      makeArticle({ title: "One headline" }),
      makeArticle({ title: "Another headline entirely" }),
      makeArticle({ title: "Third distinct headline" }),
    ];
    const ranked = rankByPopularity(articles);
    const byScore = [...articles].sort(
      (a, b) => scoreArticle({ article: b }, MOST_READ_WEIGHTS) - scoreArticle({ article: a }, MOST_READ_WEIGHTS),
    );
    expect(ranked.map((a) => a.id)).toEqual(byScore.map((a) => a.id));
  });
});

describe("sortArticles", () => {
  it("sorts newest first for 'latest'", () => {
    const old = makeArticle({
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    });
    const fresh = makeArticle({ publishedAt: new Date().toISOString() });
    const sorted = sortArticles([old, fresh], "latest");
    expect(sorted[0]!.id).toBe(fresh.id);
  });

  it("returns an unmodified copy for unknown sorts", () => {
    const articles = [makeArticle(), makeArticle()];
    const sorted = sortArticles(articles, "relevance");
    expect(sorted).toHaveLength(2);
  });
});