import { describe, expect, it } from "vitest";
import {
  clusterArticles,
  findClusterById,
  normalizeTitle,
  storySimilarity,
} from "./cluster.js";
import { makeArticle } from "./test-fixtures.js";

describe("storySimilarity", () => {
  it("scores near-identical headlines high", () => {
    const a = makeArticle({ title: "India wins the cricket world cup final in Mumbai" });
    const b = makeArticle({
      title: "India wins the cricket world cup final in Mumbai - full report",
    });
    expect(storySimilarity(a, b)).toBeGreaterThan(0.5);
  });

  it("scores unrelated headlines near zero", () => {
    const a = makeArticle({ title: "Central bank raises interest rates" });
    const b = makeArticle({ title: "New AI chip announced at tech conference" });
    expect(storySimilarity(a, b)).toBeLessThan(0.2);
  });

  it("returns 0 when titles share no meaningful keywords", () => {
    const a = makeArticle({ title: "Election results declared nationwide" });
    const b = makeArticle({ title: "Football match ends in a dramatic draw" });
    expect(storySimilarity(a, b)).toBe(0);
  });
});

describe("normalizeTitle", () => {
  it("lowercases, strips punctuation and stopwords", () => {
    expect(normalizeTitle("The New York Stock Exchange: A Record High")).toBe(
      "new york stock exchange record high",
    );
  });
});

describe("clusterArticles", () => {
  it("groups same-event stories from multiple sources into one cluster", () => {
    const shared = "Flood warnings issued across the northern regions";
    const pool = [
      makeArticle({ title: shared, sourceName: "Alpha" }),
      makeArticle({ title: `${shared} - latest update`, sourceName: "Beta" }),
      makeArticle({ title: `${shared} (revised)`, sourceName: "Gamma" }),
      makeArticle({ title: "Completely different story about finance", sourceName: "Alpha" }),
    ];
    const clusters = clusterArticles(pool);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]!.articleCount).toBe(3);
    expect(clusters[0]!.sources).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("skips stories covered by a single source", () => {
    const pool = [
      makeArticle({ title: "A story only one outlet covered" }),
      makeArticle({ title: "Another single-source story" }),
    ];
    expect(clusterArticles(pool)).toHaveLength(0);
  });

  it("respects the time window so old stories do not cluster with new ones", () => {
    const shared = "Market opens sharply higher today";
    const old = makeArticle({
      title: shared,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const fresh = makeArticle({ title: shared });
    const clusters = clusterArticles([old, fresh], { maxAgeHours: 24 });
    expect(clusters).toHaveLength(0);
  });

  it("sorts clusters by size then recency", () => {
    const a = "Budget unveiled with major tax changes";
    const b = "Budget unveiled with major tax changes (analysis)";
    const c = "Budget unveiled with major tax changes (reaction)";
    const d = "Drama at the awards ceremony";
    const e = "Drama at the awards ceremony (live)";
    const clusters = clusterArticles([
      makeArticle({ title: d, sourceName: "Alpha" }),
      makeArticle({ title: e, sourceName: "Beta" }),
      makeArticle({ title: a, sourceName: "Gamma" }),
      makeArticle({ title: b, sourceName: "Delta" }),
      makeArticle({ title: c, sourceName: "Epsilon" }),
    ]);
    expect(clusters).toHaveLength(2);
    expect(clusters[0]!.articleCount).toBeGreaterThan(clusters[1]!.articleCount);
  });
});

describe("findClusterById", () => {
  it("returns the rest of the cluster for a member article", () => {
    const shared = "Trade deal signed between the two nations";
    const alpha = makeArticle({ title: shared, sourceName: "Alpha" });
    const beta = makeArticle({ title: `${shared} - details`, sourceName: "Beta" });
    const coverage = findClusterById([alpha, beta], alpha.id);
    expect(coverage).not.toBeNull();
    expect(coverage!.articles.map((a) => a.id)).toEqual([beta.id]);
  });

  it("returns null when the article is not in any multi-source cluster", () => {
    const solo = makeArticle({ title: "An exclusive one-off scoop" });
    expect(findClusterById([solo], solo.id)).toBeNull();
  });
});