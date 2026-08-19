import { motion } from "framer-motion";
import { ArticleCard } from "./ArticleCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import type { NewsArticle } from "@/types";

interface CategorySectionProps {
  category: string;
  articles: NewsArticle[];
  isLoading?: boolean;
}

/**
 * Newspaper section: prominent serif title with rule, a lead article,
 * then a multi-column row of compact headlines separated by thin rules.
 */
export function CategorySection({ category, articles, isLoading }: CategorySectionProps) {
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  const lead = articles[0];
  const rest = articles.slice(1, 4);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35 }}
      className="mt-12"
      aria-label={`${label} news`}
    >
      <SectionTitle title={label} viewAllTo={`/category/${category}`} />

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="skeleton aspect-[16/9] rounded" />
          <div className="flex flex-col gap-4">
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Lead */}
          <div className="lg:border-r lg:border-line lg:pr-8">
            {lead ? <ArticleCard article={lead} variant="featured" showImage /> : <p className="text-sm text-mist">No stories yet.</p>}
          </div>

          {/* Compact list */}
          <div className="grid gap-0 divide-y divide-line/70">
            {rest.map((article) => (
              <div key={article.id} className="py-3 first:pt-0 last:pb-0">
                <ArticleCard article={article} variant="compact" />
              </div>
            ))}
            {rest.length === 0 && (
              <p className="text-sm text-mist">No stories yet.</p>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}