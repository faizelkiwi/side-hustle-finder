import {
  LayoutDashboard,
  Search,
  Lightbulb,
  Bookmark,
  Sparkles,
  Calculator,
  Bell,
  Settings,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Pro-only feature; shows a badge for Free accounts. */
  pro?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Find Opportunities", href: "/opportunities", icon: Search },
  { label: "Side Hustle Ideas", href: "/ideas", icon: Lightbulb },
  { label: "My Opportunities", href: "/my-opportunities", icon: Bookmark },
  { label: "AI Assistant", href: "/assistant", icon: Sparkles, pro: true },
  { label: "Budget Calculator", href: "/budget-calculator", icon: Calculator },
  { label: "Alerts", href: "/alerts", icon: Bell, pro: true },
  { label: "Plan & Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];
