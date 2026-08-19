import { Link } from "react-router-dom";
import type { NewsArticle } from "@/types";

interface TrendingListProps {
  articles: NewsArticle[];
}

export function TrendingList({ articles }: TrendingListProps) {
  return (
    <ol className="flex flex-col gap-1">
      {articles.slice(0, 6).map((article, index) => (
        <li key={article.id}>
          <Link
            to={`/article/${article.id}`}
            className="group flex items-start gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-line/30"
          >
            <span className="font-serif text-3xl font-bold leading-none text-line transition-colors group-hover:text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-accent">
                {article.title}
              </h3>
              <p className="mt-1 text-xs text-mist">
                {article.sourceName} • {article.category}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}