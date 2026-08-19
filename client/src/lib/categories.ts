/**
 * Maps a category slug to its display label.
 * Shared across all news components.
 */
const CATEGORY_LABELS: Record<string, string> = {
  top: "Top Stories",
  technology: "Technology",
  business: "Business",
  sports: "Sports",
  entertainment: "Entertainment",
  health: "Health",
  science: "Science",
  world: "World",
  india: "India",
  politics: "Politics",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
