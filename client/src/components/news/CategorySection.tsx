import { motion } from "framer-motion";
import { ArticleCard } from "./ArticleCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import type { NewsArticle } from "@/types";

interface CategorySectionProps {
  category: string;
  articles: NewsArticle[];
  isLoading?: boolean;
}

export function CategorySection({ category, articles, isLoading }: CategorySectionProps) {
  const label = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className="mt-12"
      aria-label={`${label} news`}
    >
      <SectionTitle title={label} viewAllTo={`/category/${category}`} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-3">
                <div className="skeleton aspect-[16/10] rounded-xl" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-full" />
              </div>
            ))
          : articles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
      </div>
    </motion.section>
  );
}