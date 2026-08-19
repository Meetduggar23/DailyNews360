import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Compass,
  Flame,
  History,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  Icon?: LucideIcon;
  children?: NavItem[];
}

const sub = (label: string, topic: string): NavItem => ({
  label,
  to: `/category/${topic}`,
});

/** Primary newspaper categories shown in the drawer. */
export const PRIMARY_CATEGORIES: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "India", to: "/category/india" },
  { label: "World", to: "/category/world" },
  { label: "Politics", to: "/category/politics" },
  {
    label: "Business",
    to: "/category/business",
    children: [
      sub("Markets", "business?topic=markets"),
      sub("Companies", "business?topic=companies"),
      sub("Startups", "business?topic=startups"),
      sub("Economy", "business?topic=economy"),
      sub("Finance", "business?topic=finance"),
    ],
  },
  {
    label: "Technology",
    to: "/category/technology",
    children: [
      sub("AI & Machine Learning", "technology?topic=ai"),
      sub("Gadgets", "technology?topic=gadgets"),
      sub("Software", "technology?topic=software"),
      sub("Telecom", "technology?topic=telecom"),
    ],
  },
  {
    label: "Sports",
    to: "/category/sports",
    children: [
      sub("Cricket", "sports?topic=cricket"),
      sub("Football", "sports?topic=football"),
      sub("Tennis", "sports?topic=tennis"),
      sub("Formula 1", "sports?topic=formula"),
      sub("Other Sports", "sports?topic=sports"),
    ],
  },
  {
    label: "Entertainment",
    to: "/category/entertainment",
    children: [
      sub("Bollywood", "entertainment?topic=bollywood"),
      sub("Music", "entertainment?topic=music"),
      sub("Web Shows", "entertainment?topic=web"),
    ],
  },
  { label: "Science", to: "/category/science" },
  { label: "Health", to: "/category/health" },
];

/** Secondary categories. Only routes that exist are listed. */
export const MORE_CATEGORIES: NavItem[] = [
  { label: "Opinion", to: "/category/politics" },
  { label: "Science", to: "/category/science" },
  { label: "Health", to: "/category/health" },
  {
    label: "Explore All Categories",
    to: "/category/top",
    Icon: Compass,
  },
];

/** Special editorial sections. */
export const EXPLORE_ITEMS: NavItem[] = [
  { label: "Top Stories", to: "/category/top" },
  { label: "Trending", to: "/trending", Icon: Flame },
  { label: "Most Read", to: "/#most-read" },
  { label: "Latest News", to: "/#latest-news" },
  { label: "For You", to: "/for-you", Icon: Sparkles },
  { label: "Saved", to: "/saved", Icon: Bookmark },
  { label: "Reading History", to: "/history", Icon: History },
  { label: "Sources", to: "/sources" },
];

/** Footer links inside the drawer. */
export const FOOTER_ITEMS: NavItem[] = [
  { label: "About", to: "/about" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

export interface AccountItem extends NavItem {
  action?: "logout";
}

/** Account controls depend on authentication state. */
export const ACCOUNT_ITEMS_LOGGED_OUT: AccountItem[] = [
  { label: "Sign In", to: "/login", Icon: LogIn },
  { label: "Create Account", to: "/register", Icon: User },
];

export const ACCOUNT_ITEMS_LOGGED_IN: AccountItem[] = [
  { label: "Profile", to: "/profile", Icon: User },
  { label: "For You", to: "/for-you", Icon: Sparkles },
  { label: "Saved", to: "/saved", Icon: Bookmark },
  { label: "Settings", to: "/settings", Icon: Settings },
  { label: "Sign Out", to: "/login", Icon: LogOut, action: "logout" },
];

export interface SocialLink {
  label: string;
  Icon: LucideIcon;
  url: string;
}

/**
 * Social profiles. Leave empty until real URLs are configured —
 * the drawer hides this section rather than shipping dead links.
 */
export const SOCIAL_LINKS: SocialLink[] = [];

export const NAV_ACTIVE_EXACT: string[] = ["/", "/trending", "/for-you", "/saved", "/history", "/sources"];