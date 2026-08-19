import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowUpRight, Clock, ExternalLink, PenLine } from "lucide-react";
import { useArticle } from "@/hooks/useNews";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/services/api";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { ReadProgress } from "@/components/common/ReadProgress";
import { ShareButton } from "@/components/common/ShareButton";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import { ArticleCard } from "@/components/news/ArticleCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeTime, formatDateTime } from "@/lib/date";
import { stripHtml } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const query = useArticle(id);

  const { article, related } = query.data ?? {};

  usePageMeta({
    title: article?.title,
    description: article?.description ?? undefined,
    image: article?.imageUrl ?? undefined,
    url: article ? window.location.href : undefined,
  });

  // Record reading history once per article view for authenticated users.
  const recorded = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (article && user && recorded.current !== article.id) {
      recorded.current = article.id;
      void api.recordHistory({
        articleId: article.id,
        category: article.category,
        source: article.sourceName,
      });
    }
  }, [article, user]);

  if (query.isLoading) {
    return (
      <div className="container-news py-8">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-4 h-10 w-full md:w-3/4" />
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="mt-8 aspect-[16/9] w-full rounded-xl" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (query.isError || !article) {
    return (
      <div className="container-news py-16">
        <EmptyState
          title="This story seems to have disappeared."
          message="It may have been removed by its publisher, or our news sources were unreachable."
          action={{ label: "Return to DailyNews360", onClick: () => (window.location.href = "/") }}
        />
      </div>
    );
  }

  const categoryLabel = article.category.charAt(0).toUpperCase() + article.category.slice(1);

  return (
    <article className="container-news py-8">
      <ReadProgress />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist">
        <Link to={`/category/${article.category}`} className="font-medium text-accent hover:underline">
          {categoryLabel}
        </Link>
      </nav>

      <header className="max-w-3xl">
        <Badge variant="soft" className="mb-3">
          {categoryLabel}
        </Badge>
        <h1 className="font-serif text-3xl font-bold leading-tight text-ink md:text-4xl">
          {article.title}
        </h1>
        {article.description ? (
          <p className="mt-4 text-lg leading-relaxed text-mist">{article.description}</p>
        ) : null}

        {/* Byline */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-mist">
            <span className="flex items-center gap-1.5 font-semibold text-ink">
              <PenLine className="h-4 w-4 text-accent" aria-hidden="true" />
              {article.author ?? article.sourceName}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <time dateTime={article.publishedAt}>{formatDateTime(article.publishedAt)}</time>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookmarkButton article={article} variant="full" />
            <ShareButton
              title={article.title}
              url={window.location.href}
              variant="full"
            />
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="mt-6 overflow-hidden rounded-xl">
        <ImageWithFallback src={article.imageUrl} alt={article.title} aspect="aspect-[16/9]" />
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {article.content ? (
            <div className="prose prose-sm max-w-none text-ink prose-headings:font-serif">
              {renderContent(article.content)}
            </div>
          ) : (
            <p className="leading-relaxed text-mist">
              {article.description ??
                "Full article content is available from the original publisher."}
            </p>
          )}

          {/* Source attribution */}
          <div className="mt-8 flex flex-col gap-4 rounded-xl bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-mist">
                Original source
              </p>
              <p className="mt-1 font-serif text-lg font-bold text-ink">{article.sourceName}</p>
              <p className="mt-1 text-xs text-mist">
                Aggregated by DailyNews360. Original reporting belongs to{" "}
                {article.sourceName}.
              </p>
            </div>
            <Button asChild>
              <a
                href={article.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                Read full article at source
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        {/* Related stories */}
        <aside aria-label="Related news" className="lg:border-l lg:border-line lg:pl-8">
          <h2 className="mb-4 flex items-center gap-3 font-serif text-xl font-bold text-ink">
            <span className="h-5 w-1 rounded-full bg-accent" aria-hidden="true" />
            Related News
          </h2>
          <div className="flex flex-col gap-5">
            {(related ?? []).slice(0, 4).map((story) => (
              <ArticleCard key={story.id} article={story} variant="compact" />
            ))}
            {related && related.length === 0 && (
              <p className="text-sm text-mist">No related stories available.</p>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}

function renderContent(content: string) {
  // Simple paragraph rendering for plain-text content from providers.
  const paragraphs = stripHtml(content)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    return <p className="leading-relaxed text-mist">{stripHtml(content)}</p>;
  }

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="mb-4 leading-relaxed text-ink/90">
      {paragraph}
    </p>
  ));
}