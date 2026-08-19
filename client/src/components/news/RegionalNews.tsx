import { useCategoryNews } from "@/hooks/useNews";
import { EditorialRow } from "./EditorialRow";
import { SectionTitle } from "@/components/common/SectionTitle";
import type { NewsArticle } from "@/types";

interface RegionalNewsProps {
  country?: string;
  title?: string;
  viewAllTo?: string;
}

/**
 * Regional/local news section.
 * Fetches news filtered by country when the API supports it,
 * falls back to India news as the default.
 */
export function RegionalNews({
  country = "in",
  title = "India & Regional",
  viewAllTo = "/category/india",
}: RegionalNewsProps) {
  const query = useCategoryNews("india", { pageSize: 5, country });

  const articles = query.data?.articles ?? [];

  if (query.isLoading) {
    return (
      <section className="mt-12" aria-label={title}>
        <SectionTitle title={title} viewAllTo={viewAllTo} />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="mt-12" aria-label={title}>
      <SectionTitle title={title} viewAllTo={viewAllTo} />
      <div className="grid gap-0 divide-y divide-line/70">
        {articles.slice(0, 5).map((article: NewsArticle) => (
          <div key={article.id} className="py-3 first:pt-0">
            <EditorialRow article={article} showThumbnail />
          </div>
        ))}
      </div>
    </section>
  );
}
