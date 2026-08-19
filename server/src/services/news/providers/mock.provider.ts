import { normalizeArticle } from "../normalizer.js";
import type { NewsArticle, NewsProvider, NewsQuery } from "../types.js";

/**
 * MockNewsProvider - DEVELOPMENT ONLY.
 * Provides realistic sample headlines so the UI can be developed without
 * consuming a real provider's rate limit. Enable with USE_MOCK_NEWS=true.
 * Never enable this in production; mock stories are clearly labeled.
 */

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

interface MockItem {
  title: string;
  description: string;
  category: string;
  source: string;
  hours: number;
  author?: string;
}

const STORIES: MockItem[] = [
  {
    title: "Global chipmakers race to secure AI data-center supply chains",
    description:
      "Semiconductor firms announce fresh fab investments as demand for AI infrastructure keeps climbing across three continents.",
    category: "technology",
    source: "TechRadar",
    hours: 1,
    author: "Priya Sharma",
  },
  {
    title: "Central banks hold rates as inflation cools faster than expected",
    description:
      "Policymakers signal a patient approach while consumer prices ease for a fourth consecutive month.",
    category: "business",
    source: "MarketWire",
    hours: 2,
  },
  {
    title: "Underdogs stun the league with a last-minute winner in the final",
    description:
      "A stoppage-time strike capped a dramatic comeback in one of the season's most memorable matches.",
    category: "sports",
    source: "Sportline",
    hours: 3,
  },
  {
    title: "Breakthrough vaccine shows promise in late-stage human trials",
    description:
      "Researchers report strong immune responses with no serious adverse events reported in the 12,000-person study.",
    category: "health",
    source: "HealthLine",
    hours: 4,
  },
  {
    title: "James Webb telescope captures a new view of an exoplanet atmosphere",
    description:
      "The observation reveals unexpected chemistry, adding fresh clues about worlds beyond our solar system.",
    category: "science",
    source: "SpaceScope",
    hours: 5,
    author: "Dr. Elena Voss",
  },
  {
    title: "Streaming platforms bet big on original regional content",
    description:
      "Local-language productions are driving subscriber growth as global studios expand their catalogues.",
    category: "entertainment",
    source: "ScreenDaily",
    hours: 6,
  },
  {
    title: "Summit ends with landmark climate financing agreement",
    description:
      "Delegates from 90 nations sign a framework to channel funds into clean-energy projects.",
    category: "world",
    source: "WorldBrief",
    hours: 7,
  },
  {
    title: "Rail expansion plan promises faster links across the region",
    description:
      "The new corridor aims to cut travel times by nearly half and lift freight capacity.",
    category: "india",
    source: "IndiaDesk",
    hours: 8,
  },
  {
    title: "Parliament debates new digital-privacy bill amid cross-party support",
    description:
      "Lawmakers weigh stronger consent rules as tech firms urge a balanced regulatory approach.",
    category: "politics",
    source: "PolicyPost",
    hours: 9,
  },
  {
    title: "Renewable energy hits record share of national grid output",
    description:
      "Solar and wind supplied more than a third of electricity last month, according to new data.",
    category: "science",
    source: "GridWatch",
    hours: 10,
  },
  {
    title: "Electric vehicle sales surge as charging network expands",
    description:
      "Affordable models and faster charging infrastructure are pushing adoption to record levels.",
    category: "technology",
    source: "AutoScope",
    hours: 11,
  },
  {
    title: "Farmers adopt smart irrigation to cut water use by a fifth",
    description:
      "Sensor-driven systems are helping growers reduce costs while protecting local water tables.",
    category: "business",
    source: "AgriNews",
    hours: 12,
  },
  {
    title: "Marathon record falls as runner shaves minutes off the mark",
    description:
      "Perfect conditions and a daring early pace produced one of the fastest races ever recorded.",
    category: "sports",
    source: "TrackLine",
    hours: 14,
  },
  {
    title: "New study links better sleep to improved memory retention",
    description:
      "Researchers found that consistent sleep schedules boosted recall scores in controlled trials.",
    category: "health",
    source: "MindMatters",
    hours: 16,
  },
  {
    title: "Award season opens with a surprise favorite at the premiere",
    description:
      "Early reviews put the quiet independent drama in pole position for the top prize.",
    category: "entertainment",
    source: "ScreenDaily",
    hours: 18,
  },
];

export class MockNewsProvider implements NewsProvider {
  readonly name = "mock";

  private all(): NewsArticle[] {
    return STORIES.map((item, index) =>
      normalizeArticle({
        provider: "mock",
        rawId: `mock-${index}`,
        title: item.title,
        description: item.description,
        sourceName: item.source,
        articleUrl: `https://example.com/stories/mock-${index}`,
        author: item.author ?? null,
        publishedAt: hoursAgo(item.hours),
        category: item.category,
        country: "global",
        language: "en",
      }),
    );
  }

  getTopNews(_params?: NewsQuery): Promise<NewsArticle[]> {
    return Promise.resolve(this.all());
  }

  getCategoryNews(category: string, params?: NewsQuery): Promise<NewsArticle[]> {
    const articles = this.all().filter((a) => a.category === category);
    return Promise.resolve(articles.slice(0, params?.pageSize ?? articles.length));
  }

  searchNews(query: string, _params?: NewsQuery): Promise<NewsArticle[]> {
    const q = query.toLowerCase();
    return Promise.resolve(
      this.all().filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description ?? "").toLowerCase().includes(q),
      ),
    );
  }
}