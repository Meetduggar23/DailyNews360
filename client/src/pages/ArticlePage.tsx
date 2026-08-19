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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeTime, formatDateTime } from "@/lib/date";
import { stripHtml } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";

function readingTime(text: string | null | undefined): number {
  if (!text) return 0;
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const query = useArticle(id);

  const { article, related, coverage } = query.data ?? {};

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

  // Keep a local id->title map so the History page can show real headlines.
  React.useEffect(() => {
    if (!article) return;
    try {
      const cache = window.localStorage.getItem("dn360:historyTitles");
      const titles = cache ? (JSON.parse(cache) as Record<string, string>) : {};
      if (titles[article.id] !== article.title) {
        titles[article.id] = article.title;
        window.localStorage.setItem("dn360:historyTitles", JSON.stringify(titles));
      }
    } catch {
      // ignore
    }
  }, [article]);

  if (query.isLoading) {
    return (
      <div className="container-news py-8">
        <div className="mx-auto max-w-article">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-4 h-12 w-full" />
          <Skeleton className="mt-3 h-4 w-64" />
          <Skeleton className="mt-8 aspect-[16/9] w-full rounded" />
          <div className="mt-8 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
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

      <div className="mx-auto max-w-article">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 font-sans text-xs uppercase tracking-widest">
          <Link
            to={`/category/${article.category}`}
            className="font-bold text-accent hover:underline"
          >
            {categoryLabel}
          </Link>
        </nav>

        <header>
          <h1 className="font-serif text-3xl font-bold leading-tight text-ink md:text-5xl md:leading-[1.12]">
            {article.title}
          </h1>
          {article.description ? (
            <p className="mt-4 font-serif text-xl leading-relaxed text-secondary">
              {article.description}
            </p>
          ) : null}

          {/* Byline */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-sm text-secondary">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <PenLine className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {article.author ?? article.sourceName}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <time dateTime={article.publishedAt}>{formatDateTime(article.publishedAt)}</time>
              </span>
              <span className="hidden text-mist sm:inline">•</span>
              <span className="text-mist">
                {relativeTime(article.publishedAt)}
                {readingTime(article.content) > 0
                  ? ` • ${readingTime(article.content)} min read`
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookmarkButton article={article} variant="full" />
              <ShareButton title={article.title} url={window.location.href} variant="full" />
            </div>
          </div>
        </header>

        {/* Hero image */}
        <figure className="mt-6">
          <ImageWithFallback src={article.imageUrl} alt={article.title} aspect="aspect-[16/9]" />
        </figure>

        {/* Body */}
        <div className="mt-8">
          <div className="prose max-w-none font-serif text-lg leading-[1.75] text-ink prose-headings:font-serif">
            {renderContent(article.content, article.description)}
          </div>

          {/* Source attribution */}
          <div className="mt-10 flex flex-col gap-4 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-mist">
                Original source
              </p>
              <p className="mt-1 font-serif text-xl font-bold text-ink">{article.sourceName}</p>
              <p className="mt-1 max-w-md font-sans text-xs text-mist">
                Aggregated by DailyNews360. Original reporting belongs to {article.sourceName}.
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
      </div>

      {/* Every Story. Every Angle. - multi-source coverage */}
      {coverage && coverage.length > 0 ? (
        <section className="mt-12 border-t border-line pt-8" aria-label="Every Story, Every Angle">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-1 border-b-2 border-ink pb-2 font-serif text-2xl font-bold uppercase tracking-wide text-ink dark:border-ink/80">
              Every Story. Every Angle.
            </h2>
            <p className="mt-3 max-w-2xl font-serif text-[15px] leading-relaxed text-secondary">
              This story is being reported by other outlets too. Compare the
              angles to build a fuller picture.
            </p>
            <div className="mt-5 grid gap-0 md:grid-cols-2 md:gap-x-10">
              <div className="grid gap-0 divide-y divide-line/70 md:pr-10">
                {coverage.slice(0, Math.ceil(coverage.length / 2)).map((story) => (
                  <div key={story.id} className="py-3 first:pt-0">
                    <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
                      {story.sourceName}
                    </p>
                    <Link
                      to={`/article/${story.id}`}
                      className="group mt-1 block font-serif text-[15px] font-semibold leading-snug text-ink transition-colors hover:text-accent"
                    >
                      {story.title}
                    </Link>
                  </div>
                ))}
              </div>
              <div className="grid gap-0 divide-y divide-line/70">
                {coverage.slice(Math.ceil(coverage.length / 2)).map((story) => (
                  <div key={story.id} className="py-3 first:pt-0">
                    <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
                      {story.sourceName}
                    </p>
                    <Link
                      to={`/article/${story.id}`}
                      className="group mt-1 block font-serif text-[15px] font-semibold leading-snug text-ink transition-colors hover:text-accent"
                    >
                      {story.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Related stories */}
      <section className="mt-12 border-t border-line pt-8" aria-label="Related news">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-5 border-b-2 border-ink pb-2 font-serif text-2xl font-bold uppercase tracking-wide text-ink dark:border-ink/80">
            Related Stories
          </h2>
          {(related ?? []).slice(0, 3).length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {(related ?? []).slice(0, 3).map((story) => (
                <ArticleCard key={story.id} article={story} variant="standard" />
              ))}
            </div>
          ) : (
            <p className="font-sans text-sm text-mist">No related stories available.</p>
          )}
          {related && related.length > 3 ? (
            <div className="mt-6">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/category/${article.category}`} className="gap-1">
                  More {categoryLabel} news
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </article>
  );
}

function renderContent(content: string | null, description: string | null) {
  const paragraphs = (content ? stripHtml(content) : description ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    const text = stripHtml(content ?? description ?? "");
    if (!text) return <p className="text-secondary">Full article content is available from the original publisher.</p>;
    return <p className="mb-4">{text}</p>;
  }

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="mb-5">
      {paragraph}
    </p>
  ));
}