import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";
import { usePageMeta } from "@/hooks/usePageMeta";

export function NotFoundPage() {
  usePageMeta({
    title: "Page not found",
    description: "This page could not be found.",
  });
  return (
    <div className="container-news flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-serif text-7xl font-bold text-line md:text-9xl">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-ink">
        This story seems to have disappeared.
      </h1>
      <p className="mt-2 max-w-md text-sm text-mist">
        The page you're looking for may have moved, or the link might be broken.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link to="/">Return to DailyNews360</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/search">Search news</Link>
        </Button>
      </div>
      <div className="mt-8 opacity-60">
        <Logo />
      </div>
    </div>
  );
}