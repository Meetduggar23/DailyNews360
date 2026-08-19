import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 select-none items-center justify-center rounded-full bg-accent text-sm font-semibold text-white",
        className,
      )}
    >
      {initials(name) || "U"}
    </span>
  );
}