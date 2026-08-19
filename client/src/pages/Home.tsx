import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useCategoryNews, useHomeData } from "@/hooks/useNews";
import { BreakingTicker } from "@/components/news/BreakingTicker";
import { HeroSection } from "@/components/news/HeroSection";
import { CategorySection } from "@/components/news/CategorySection";
import { ArticleCard } from "@/components/news/ArticleCard";
import { TrendingList } from "@/components/news/TrendingList";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SkeletonHero } from "@/components/common/SkeletonStates";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { BRAND } from "@/constants";

function CategorySectionLoader({ category }: { category: string }) {
  const query = useCategoryNews(category, { pageSize: 4 });
  return (
    <CategorySection
      category={category}
      articles={query.data?.articles ?? []}
      isLoading={query.isLoading}
    />
  );
}

/** Combined Science + Health front-page section. */
function ScienceHealthSection() {
  const science = useCategoryNews("science", { pageSize: 2 });
  const health = useCategoryNews("health", { pageSize: 2 });
  const scienceArticles = science.data?.articles ?? [];
  const healthArticles = health.data?.articles ?? [];

  return (
    <section className="mt-12" aria-label="Science and Health">
      <SectionTitle title="Science & Health" viewAllTo="/category/science" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lg:border-r lg:border-line lg:pr-8">
          {science.isLoading || health.isLoading ? (
            <div className="space-y-4">
              <div className="skeleton h-24" />
              <div className="skeleton h-24" />
            </div>
          ) : (
            <div className="grid gap-0 divide-y divide-line/70">
              {[...scienceArticles.slice(0, 1), ...healthArticles.slice(0, 1)].map((article) => (
                <div key={article.id} className="py-3 first:pt-0">
                  <ArticleCard article={article} variant="compact" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {science.isLoading || health.isLoading ? (
            <div className="space-y-4">
              <div className="skeleton h-24" />
              <div className="skeleton h-24" />
            </div>
          ) : (
            <div className="grid gap-0 divide-y divide-line/70">
              {[...scienceArticles.slice(1, 2), ...healthArticles.slice(1, 2)].map((article) => (
                <div key={article.id} className="py-3 first:pt-0">
                  <ArticleCard article={article} variant="compact" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  usePageMeta({
    description:
      "DailyNews360 — Every Story. Every Angle. Real-time news from India, the world, technology, business and more.",
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
            {/* Lead stories */}
            <HeroSection main={main} secondary={secondary} />

            {/* Latest news - multi-column editorial grid */}
            <section className="mt-12" aria-label="Latest news">
              <SectionTitle title="Latest News" />
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {latest.slice(0, 9).map((article, index) => (
                  <div
                    key={article.id}
                    className={index % 3 === 0 ? "sm:col-span-2 lg:col-span-1" : ""}
                  >
                    <ArticleCard
                      article={article}
                      variant={index % 3 === 0 ? "list" : "standard"}
                      showImage={index % 3 === 0}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Front-page category sections */}
            <CategorySectionLoader category="india" />
            <CategorySectionLoader category="world" />
            <CategorySectionLoader category="business" />
            <CategorySectionLoader category="technology" />
            <CategorySectionLoader category="sports" />
            <CategorySectionLoader category="entertainment" />
            <ScienceHealthSection />

            {/* Opinion - clearly labeled */}
            <section className="mt-12" aria-label="Opinion">
              <SectionTitle title="Opinion" viewAllTo="/category/politics" />
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="lg:border-r lg:border-line lg:pr-8">
                  {latest[0] ? <ArticleCard article={latest[0]} variant="featured" showImage /> : <p className="text-sm text-mist">No stories yet.</p>}
                </div>
                <div className="grid gap-0 divide-y divide-line/70">
                  {latest.slice(1, 4).map((article) => (
                    <div key={article.id} className="py-3 first:pt-0">
                      <ArticleCard article={article} variant="compact" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Trending */}
            <div className="mt-12 grid gap-10 lg:grid-cols-3">
              <section className="lg:col-span-2" aria-label="Trending stories">
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

              <aside className="border-l-2 border-accent pl-6" aria-label="For you">
                <Sparkles className="h-6 w-6 text-accent" aria-hidden="true" />
                <h2 className="mt-3 font-serif text-xl font-bold text-ink">For You</h2>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  Stories selected from the topics you follow. {BRAND.taglineAlternative}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button size="sm" asChild>
                    <Link to="/for-you">Build my feed</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/category/top">Browse all stories</Link>
                  </Button>
                </div>
              </aside>
            </div>
          </>
        )}

        {!isLoading && !hasError && !main && (
          <EmptyState kind="empty" message="No stories available right now. Check back soon." />
        )}
      </div>
    </div>
  );
}