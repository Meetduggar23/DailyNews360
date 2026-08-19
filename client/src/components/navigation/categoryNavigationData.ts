export interface CategoryNavItem {
  label: string;
  to: string;
  icon?: boolean;
}

export const CATEGORY_NAV_ITEMS: CategoryNavItem[] = [
  { label: "Home", to: "/" },
  { label: "India", to: "/category/india" },
  { label: "World", to: "/category/world" },
  { label: "Politics", to: "/category/politics" },
  { label: "Business", to: "/category/business" },
  { label: "Technology", to: "/category/technology" },
  { label: "Sports", to: "/category/sports" },
  { label: "Entertainment", to: "/category/entertainment" },
  { label: "Science", to: "/category/science" },
  { label: "Health", to: "/category/health" },
  { label: "Top Stories", to: "/category/top" },
  { label: "Trending", to: "/trending" },
  { label: "Exclusive", to: "/exclusive", icon: true },
];
