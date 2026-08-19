import * as React from "react";

const SITE_NAME = "DailyNews360";

interface MetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/**
 * Sets document title + Open Graph / Twitter metadata for a page.
 * Mirrors server-side SEO on the client for public routes.
 */
export function usePageMeta(options: MetaOptions): void {
  React.useEffect(() => {
    const fullTitle = options.title
      ? `${options.title} · ${SITE_NAME}`
      : `${SITE_NAME} — Every Story. Every Angle.`;
    document.title = fullTitle;

    const description =
      options.description ?? "A modern real-time news aggregator. Your world, one feed.";
    const url = options.url ?? window.location.href;
    const image = options.image ?? "/og-cover.svg";

    setMeta("description", description);
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:url", url);
    setMeta("og:image", image);
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
  }, [options.title, options.description, options.image, options.url]);
}

function setMeta(property: string, content: string): void {
  const selector =
    property.startsWith("og:") || property.startsWith("twitter:")
      ? `meta[property="${property}"], meta[name="${property}"]`
      : `meta[name="${property}"]`;
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    if (property.startsWith("og:")) element.setAttribute("property", property);
    else element.setAttribute("name", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}