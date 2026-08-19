import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useCategoryNews, useClusters, useHomeData, useMostRead } from "@/hooks/useNews";
import { BreakingTicker } from "@/components/news/BreakingTicker";
import { HeroSection } from "@/components/news/HeroSection";
import { CategorySection } from "@/components/news/CategorySection";
import { EditorialRow } from "@/components/news/EditorialRow";
import { EveryStoryEveryAngle } from "@/components/news/EveryStoryEveryAngle";
import { RefreshBar } from "@/components/news/RefreshBar";
import { NewsletterSection } from "@/components/news/NewsletterSection";
import { RegionalNews } from "@/components/news/RegionalNews";
import { TrendingList } from "@/components/news/TrendingList";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SkeletonHero } from "@/components/common/SkeletonStates";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { BRAND } from "@/constants";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types";

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
                  <ArticleCardInline article={article} />
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
                  <ArticleCardInline article={article} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Thin re-export so the Science/Health block keeps its compact rows. */
function ArticleCardInline({ article }: { article: NewsArticle }) {
  return <EditorialRow article={article} />;
}

export function HomePage() {
  usePageMeta({
    description:
      "DailyNews360 — Every Story. Every Angle. Real-time news from India, the world, technology, business and more.",
  });
  const { top, trending, main, secondary, latest } = useHomeData();
  const clusters = useClusters(5);
  const mostRead = useMostRead(6);

  const isLoading = top.isLoading;
  const hasError = top.isError;
  const isRefreshing = top.isFetching;

  function refreshAll() {
    void top.refetch();
    void clusters.refetch();
    void mostRead.refetch();
  }

  return (
    <div>
      <BreakingTicker articles={top.data?.articles ?? []} />

      <div className="container-news pb-8">
        {isLoading && <SkeletonHero />}

        {!isLoading && hasError && (
          <EmptyState kind="error" onRetry={() => void top.refetch()} />
        )}

        {!isLoading && !hasError && main && (
          <>
            {/* Updated status + refresh */}
            <RefreshBar
              updatedAt={new Date(top.dataUpdatedAt ?? Date.now()).toISOString()}
              onRefresh={refreshAll}
              isRefreshing={isRefreshing}
            />

            {/* Lead stories */}
            <HeroSection main={main} secondary={secondary} />

            {/* Latest news - compact editorial rows */}
            <section id="latest-news" className="mt-12 scroll-mt-24" aria-label="Latest news">
              <SectionTitle title="Latest News" />
              <div className="grid gap-x-10 md:grid-cols-2">
                {[0, 1].map((column) => (
                  <div
                    key={column}
                    className={cn(
                      "grid gap-0 divide-y divide-line/70",
                      column === 0 && "md:border-r md:border-line md:pr-10",
                      column === 1 && "md:pl-10",
                    )}
                  >
                    {latest.slice(column * 4, column * 4 + 4).map((article) => (
                      <div key={article.id} className="py-4 first:pt-0">
                        <EditorialRow article={article} showThumbnail />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* Every Story. Every Angle. - multi-source coverage */}
            <EveryStoryEveryAngle
              clusters={clusters.data?.clusters ?? []}
              isLoading={clusters.isLoading}
            />

            {/* Front-page category sections */}
            <CategorySectionLoader category="india" />
            <CategorySectionLoader category="world" />
            <CategorySectionLoader category="business" />
            <CategorySectionLoader category="technology" />
            <CategorySectionLoader category="sports" />
            <CategorySectionLoader category="entertainment" />
            <ScienceHealthSection />

            {/* Regional / Local News */}
            <RegionalNews />

            {/* Opinion - clearly labeled */}
            <section className="mt-12" aria-label="Opinion">
              <SectionTitle title="Opinion" viewAllTo="/category/politics" />
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="lg:border-r lg:border-line lg:pr-8">
                  {latest[0] ? (
                    <EditorialRow article={latest[0]} />
                  ) : (
                    <p className="text-sm text-mist">No stories yet.</p>
                  )}
                </div>
                <div className="grid gap-0 divide-y divide-line/70">
                  {latest.slice(1, 4).map((article) => (
                    <div key={article.id} className="py-3 first:pt-0">
                      <EditorialRow article={article} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Most Read - numbered editorial ranking */}
            <section id="most-read" className="mt-12 scroll-mt-24" aria-label="Most read stories">
              <SectionTitle title="Most Read" />
              {mostRead.isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="skeleton h-8 w-8" />
                      <div className="skeleton h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-x-10 md:grid-cols-2">
                  {[0, 1].map((column) => (
                    <div
                      key={column}
                      className={cn(
                        "grid gap-0 divide-y divide-line/70",
                        column === 0 && "md:border-r md:border-line md:pr-10",
                        column === 1 && "md:pl-10",
                      )}
                    >
                      {(mostRead.data?.articles ?? []).slice(column * 3, column * 3 + 3).map((article, index) => (
                        <div key={article.id} className="py-3.5 first:pt-0">
                          <EditorialRow article={article} rank={column * 3 + index + 1} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Trending + For You */}
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

            {/* Newsletter */}
            <NewsletterSection />
          </>
        )}

        {!isLoading && !hasError && !main && (
          <EmptyState kind="empty" message="No stories available right now. Check back soon." />
        )}
      </div>
    </div>
  );
}