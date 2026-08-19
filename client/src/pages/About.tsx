import { Link } from "react-router-dom";
import { BRAND } from "@/constants";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

export function AboutPage() {
  usePageMeta({
    title: "About",
    description:
      "DailyNews360 aggregates headlines from trusted publishers into one clean, fast news feed.",
  });
  return (
    <div className="container-news max-w-3xl py-12">
      <header className="mb-10 border-b border-line pb-8">
        <h1 className="font-serif text-4xl font-bold text-ink">About DailyNews360</h1>
        <p className="mt-3 text-lg text-mist">{BRAND.tagline}</p>
      </header>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-mist">
        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">What is DailyNews360?</h2>
          <p>
            DailyNews360 is a real-time news aggregator. It gathers headlines from trusted
            publishers around the world and presents them in one clean, fast interface — so you
            can stay informed without hopping between dozens of websites. {BRAND.taglineSecondary}
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">How aggregation works</h2>
          <p>
            Our backend continuously queries several free news APIs (see{" "}
            <Link to="/sources" className="text-accent hover:underline">
              Sources
            </Link>
            ) and normalizes their responses into a single consistent format. Stories are
            deduplicated and ranked by recency, relevance and reader interest, then served to
            you with aggressive caching so the experience stays fast and respects each
            provider's rate limits.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">Source attribution</h2>
          <p>
            DailyNews360 does not create original journalism. Every story is clearly attributed
            to its original publisher, and every article page links directly back to the source.
            Original reporting and copyright belong to the respective publishers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">Personalization</h2>
          <p>
            When you sign in, you can choose the topics you care about. DailyNews360 builds your
            "For You" feed using a transparent rule-based ranking that weighs your selected
            interests, recent reading and bookmarks together with story freshness. It's simple
            and predictable — not a black-box recommendation system.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">Privacy philosophy</h2>
          <p>
            We store only what's needed to make the product work: your account, bookmarks,
            interests and reading history. You can review and clear this data at any time from
            Settings. Anonymous visitors can browse without an account, with bookmarks kept
            locally on their device. See our{" "}
            <Link to="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">API-powered architecture</h2>
          <p>
            The product is built on a provider abstraction layer. Each news source is an
            adapter behind a common interface, so providers can be added, swapped or disabled
            without touching the frontend. If one provider is unavailable, the system falls
            back to the next — so you keep reading.
          </p>
        </section>

        <div className="flex gap-3 pt-4">
          <Button asChild>
            <Link to="/">Browse the news</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/sources">View sources</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}