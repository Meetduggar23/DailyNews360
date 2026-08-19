import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { NewsArticle } from "@/types";

export function useTopNews(pageSize = 30) {
  return useQuery({
    queryKey: ["news", "top", pageSize],
    queryFn: () => api.topNews({ pageSize }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useCategoryNews(
  category: string,
  params: Record<string, string | number | undefined> = {},
) {
  return useQuery({
    queryKey: ["news", "category", category, params],
    queryFn: () => api.categoryNews(category, params),
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchNews(
  params: Record<string, string | number | undefined>,
  enabled = true,
) {
  return useQuery({
    queryKey: ["news", "search", params],
    queryFn: () => api.searchNews(params),
    enabled: enabled && Boolean(params.q),
    staleTime: 60_000,
  });
}

export function useTrending(pageSize = 6) {
  return useQuery({
    queryKey: ["news", "trending", pageSize],
    queryFn: () => api.trending({ pageSize }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useClusters(pageSize = 5) {
  return useQuery({
    queryKey: ["news", "clusters", pageSize],
    queryFn: () => api.clusters({ pageSize }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMostRead(pageSize = 6) {
  return useQuery({
    queryKey: ["news", "most-read", pageSize],
    queryFn: () => api.mostRead({ pageSize }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ["news", "article", id],
    queryFn: () => api.article(id as string),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSources() {
  return useQuery({
    queryKey: ["sources"],
    queryFn: () => api.sources(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: () => api.feed(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Combines top stories with category stories for the homepage. */
export function useHomeData() {
  const top = useTopNews(30);
  const trending = useTrending(6);

  const main = top.data?.articles?.[0];
  const secondary = top.data?.articles?.slice(1, 4) ?? [];

  const latest = top.data?.articles?.slice(4) ?? [];

  return { top, trending, main, secondary, latest };
}

export type { NewsArticle };