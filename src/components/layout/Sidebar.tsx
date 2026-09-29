"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase } from "lucide-react";
import clsx from "clsx";
import { NAV_ITEMS } from "./navItems";
import { AccountPanel } from "./AccountPanel";
import { useAccount } from "@/components/account/AccountProvider";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const account = useAccount();
  const isPro = account?.plan === "pro";

  return (
    <div className="flex h-full flex-col bg-white">
      <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Briefcase size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">Side Hustle Finder</p>
          <p className="text-xs leading-tight text-muted">Daily Intelligence Dashboard</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
              <span className="flex-1">{item.label}</span>
              {item.pro && !isPro && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                  Pro
                </span>
              )}
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
