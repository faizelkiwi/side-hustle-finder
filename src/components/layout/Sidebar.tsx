"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase } from "lucide-react";
import clsx from "clsx";
import { NAV_ITEMS } from "./navItems";
import { AccountPanel } from "./AccountPanel";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Briefcase size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">Side Hustle Finder</p>
          <p className="text-xs leading-tight text-muted">Daily Intelligence Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-foreground",
              )}
            >
              <Icon size={18} className={active ? "text-brand-600" : "text-gray-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <AccountPanel onNavigate={onNavigate} />

      <div className="mx-3 mb-4 rounded-lg border border-border bg-gray-50 p-3">
        <p className="text-xs font-medium text-foreground">Due-diligence reminder</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Trust and risk scores are guidance only. Always verify an opportunity yourself before paying money or
          sharing personal information.
        </p>
      </div>
    </div>
  );
}
