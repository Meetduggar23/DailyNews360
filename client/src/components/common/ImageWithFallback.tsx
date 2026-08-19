import * as React from "react";
import { Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  alt: string;
  aspect?: string;
}

/**
 * Renders a news image with a loading shimmer and a clean editorial
 * placeholder when the image fails to load or is missing.
 */
export function ImageWithFallback({
  src,
  alt,
  aspect = "aspect-[16/10]",
  className,
  ...props
}: ImageWithFallbackProps) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error",
  );

  React.useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  return (
    <div className={cn("relative w-full overflow-hidden bg-line/50", aspect, className)}>
      {status === "loading" && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      {src && status !== "error" ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            "h-full w-full object-cover",
            status === "loading" ? "opacity-0" : "opacity-100 transition-opacity duration-500",
          )}
          {...props}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-line/60 to-line/30"
          role="img"
          aria-label={alt}
        >
          <Newspaper className="h-8 w-8 text-mist/50" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}