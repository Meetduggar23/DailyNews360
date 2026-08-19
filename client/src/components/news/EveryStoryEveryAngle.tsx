import { Link } from "react-router-dom";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { EmptyState } from "@/components/common/EmptyState";
import { relativeTime } from "@/lib/date";
import { BRAND } from "@/constants";
import { categoryLabel } from "@/components/news/EditorialRow";
import type { StoryCluster } from "@/types";

interface EveryStoryEveryAngleProps {
  clusters: StoryCluster[];
  isLoading?: boolean;
}

function SourceStrip({ cluster, limit = 4 }: { cluster: StoryCluster; limit?: number }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-mist">
        Also reporting:
      </span>
      {cluster.articles.slice(0, limit).map((article, index) => (
        <span key={article.id} className="inline-flex items-baseline gap-3">
          {index > 0 ? <span className="text-line">•</span> : null}
          <Link
            to={`/article/${article.id}`}
            className="font-sans text-xs font-semibold text-accent underline-offset-2 transition-colors hover:underline"
          >
            {article.sourceName}
          </Link>
        </span>
      ))}
    </div>
  );
}

function ClusterSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="skeleton aspect-[16/9] lg:col-span-2" />
        <div className="space-y-3 lg:col-span-3">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-6 w-full" />
          <div className="skeleton h-6 w-3/4" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="skeleton h-32" />
        <div className="skeleton h-32" />
      </div>
    </div>
  );
}

/**
 * "Every Story. Every Angle." — the signature section. Surface-driven story
 * clusters: the same event as reported by multiple independent outlets,
 * letting readers compare angles side by side.
 */
export function EveryStoryEveryAngle({ clusters, isLoading }: EveryStoryEveryAngleProps) {
  if (isLoading) return <ClusterSkeleton />;
  if (clusters.length === 0) {
    return (
      <EmptyState
        kind="empty"
        message="No multi-source stories right now. Check back soon."
      />
    );
  }

  const lead = clusters[0]!;
  const rest = clusters.slice(1);

  return (
    <section className="mt-12" aria-label="Every Story, Every Angle">
      <SectionTitle title={BRAND.tagline} />

      {/* Lead cluster - full editorial treatment */}
      <div className="grid gap-6 lg:grid-cols-5 lg:border-b lg:border-line lg:pb-8">
        <Link
          to={`/article/${lead.articles[0]?.id ?? lead.id}`}
          className="group block lg:col-span-2"
        >
          <div className="overflow-hidden">
            <ImageWithFallback
              src={lead.imageUrl}
              alt={lead.title}
              aspect="aspect-[16/9]"
              className="transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        </Link>
        <div className="lg:col-span-3">
          <p className="flex items-baseline gap-2 font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
            {categoryLabel(lead.category)}
            <span className="font-normal normal-case tracking-normal text-mist">
              {relativeTime(lead.publishedAt)}
            </span>
          </p>
          <Link
            to={`/article/${lead.articles[0]?.id ?? lead.id}`}
            className="group mt-2 block"
          >
            <h3 className="font-serif text-2xl font-bold leading-tight text-ink transition-colors group-hover:text-accent md:text-3xl">
              {lead.title}
            </h3>
          </Link>
          {lead.description ? (
            <p className="mt-3 line-clamp-3 font-serif text-[16px] leading-relaxed text-secondary">
              {lead.description}
            </p>
          ) : null}
          <div className="mt-4 border-t border-line pt-3">
            <SourceStrip cluster={lead} />
          </div>
        </div>
      </div>

      {/* Remaining clusters - compact two-column grid */}
      <div className="grid gap-6 md:grid-cols-2 md:gap-x-10">
        {rest.map((cluster) => (
          <div key={cluster.id} className="border-b border-line py-6 first-of-type:pt-6">
            <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
              {categoryLabel(cluster.category)}
            </p>
            <Link
              to={`/article/${cluster.articles[0]?.id ?? cluster.id}`}
              className="group mt-1.5 block"
            >
              <h4 className="line-clamp-3 font-serif text-lg font-bold leading-snug text-ink transition-colors group-hover:text-accent">
                {cluster.title}
              </h4>
            </Link>
            {cluster.description ? (
              <p className="mt-1.5 line-clamp-2 font-sans text-sm leading-relaxed text-secondary">
                {cluster.description}
              </p>
            ) : null}
            <p className="mt-2 font-sans text-xs text-mist">
              {cluster.articleCount} stories • {relativeTime(cluster.publishedAt)}
            </p>
            <div className="mt-2">
              <SourceStrip cluster={cluster} limit={3} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}