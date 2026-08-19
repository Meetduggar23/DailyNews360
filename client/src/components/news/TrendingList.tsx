import { Link } from "react-router-dom";
import type { NewsArticle } from "@/types";

interface TrendingListProps {
  articles: NewsArticle[];
  showAll?: boolean;
}

export function TrendingList({ articles, showAll = true }: TrendingListProps) {
  return (
    <ol className="flex flex-col">
      {articles.slice(0, showAll ? 6 : 5).map((article, index) => (
        <li
          key={article.id}
          className="border-b border-line/70 last:border-b-0"
        >
          <Link
            to={`/article/${article.id}`}
            className="group flex items-baseline gap-4 py-3"
          >
            <span className="font-serif text-2xl font-bold leading-none text-line transition-colors group-hover:text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-ink group-hover:text-accent">
                {article.title}
              </h3>
              <p className="mt-0.5 font-sans text-xs text-mist">
                {article.sourceName}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}