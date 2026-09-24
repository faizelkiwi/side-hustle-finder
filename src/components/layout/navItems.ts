import {
  LayoutDashboard,
  Search,
  Lightbulb,
  Bookmark,
  Sparkles,
  Calculator,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Find Opportunities", href: "/opportunities", icon: Search },
  { label: "Side Hustle Ideas", href: "/ideas", icon: Lightbulb },
  { label: "My Opportunities", href: "/my-opportunities", icon: Bookmark },
  { label: "AI Assistant", href: "/assistant", icon: Sparkles },
  { label: "Budget Calculator", href: "/budget-calculator", icon: Calculator },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];
