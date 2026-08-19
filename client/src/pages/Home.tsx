import { useCategoryNews, useHomeData } from "@/hooks/useNews";
import { BreakingTicker } from "@/components/news/BreakingTicker";
import { HeroSection } from "@/components/news/HeroSection";
import { CategorySection } from "@/components/news/CategorySection";
import { TrendingList } from "@/components/news/TrendingList";
import { ArticleCard } from "@/components/news/ArticleCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SkeletonHero } from "@/components/common/SkeletonStates";
import { EmptyState } from "@/components/common/EmptyState";
import { BRAND, HOME_SECTIONS } from "@/constants";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

function CategorySectionLoader({ category }: { category: string }) {
  const query = useCategoryNews(category, { pageSize: 3 });
  return (
    <CategorySection
      category={category}
      articles={query.data?.articles ?? []}
      isLoading={query.isLoading}
    />
  );
}

export function HomePage() {
  usePageMeta({
    description:
      "DailyNews360 — Every Story. Every Angle. Real-time news from technology, business, sports and more.",
  });
  const { top, trending, main, secondary, latest } = useHomeData();

  const isLoading = top.isLoading;
  const hasError = top.isError;

  return (
    <div>
      <BreakingTicker articles={top.data?.articles ?? []} />

      <div className="container-news py-8">
        {isLoading && <SkeletonHero />}

        {!isLoading && hasError && (
          <EmptyState kind="error" onRetry={() => void top.refetch()} />
        )}

        {!isLoading && !hasError && main && (
          <>
            <HeroSection main={main} secondary={secondary} />

            {/* Latest news */}
            <section className="mt-12" aria-label="Latest news">
              <SectionTitle title="Latest News" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latest.slice(0, 6).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>

            {/* Trending + For You CTA */}
            <div className="mt-12 grid gap-10 lg:grid-cols-3">
              <section aria-label="Trending stories">
                <SectionTitle title="Trending" viewAllTo="/trending" />
                {trending.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="skeleton h-8 w-8" />
                        <div className="skeleton h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <TrendingList articles={trending.data?.articles ?? []} />
                )}
              </section>

              <div className="lg:col-span-2">
                <div className="flex h-full flex-col justify-center gap-4 rounded-xl bg-accent/5 p-8 ring-1 ring-accent/20">
                  <Sparkles className="h-8 w-8 text-accent" aria-hidden="true" />
                  <h2 className="font-serif text-2xl font-bold text-ink">
                    Your feed, built around you.
                  </h2>
                  <p className="max-w-md text-sm text-mist">
                    Tell us what you care about and we'll surface the stories that matter most.
                    {BRAND.taglineAlternative}
                  </p>
                  <div className="mt-2 flex gap-3">
                    <Button asChild>
                      <Link to="/for-you">
                        Build my feed
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/category/top">Browse stories</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Category sections */}
            {HOME_SECTIONS.map((category) => (
              <CategorySectionLoader key={category} category={category} />
            ))}
          </>
        )}

        {!isLoading && !hasError && !main && (
          <EmptyState kind="empty" message="No stories available right now. Check back soon." />
        )}
      </div>
    </div>
  );
}