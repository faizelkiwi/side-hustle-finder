"use client";

import { Mail, MessageCircle, BellRing } from "lucide-react";
import { useSettingsStore } from "@/lib/store/settings";

export function NotificationPreferences() {
  const { notifyEmail, notifyWhatsApp, notifyBrowser, update } = useSettingsStore();

  const rows = [
    {
      key: "notifyEmail" as const,
      icon: Mail,
      label: "Email alerts",
      description: "Daily digest of new opportunities sent to your inbox.",
      value: notifyEmail,
    },
    {
      key: "notifyWhatsApp" as const,
      icon: MessageCircle,
      label: "WhatsApp alerts",
      description: "High-priority matches sent via WhatsApp.",
      value: notifyWhatsApp,
    },
    {
      key: "notifyBrowser" as const,
      icon: BellRing,
      label: "Browser notifications",
      description: "Real-time push notifications while the app is open.",
      value: notifyBrowser,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Notification channels</p>
      <p className="mt-0.5 text-xs text-muted">
        Preferences are saved to this device. Delivery integrations are not yet connected - this configures what
        will be sent once they go live.
      </p>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <label
            key={row.key}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
          >
            <span className="flex items-center gap-3">
              <row.icon size={16} className="text-gray-400" />
              <span>
                <span className="block text-sm font-medium text-foreground">{row.label}</span>
                <span className="block text-xs text-muted">{row.description}</span>
              </span>
            </span>
            <input
              type="checkbox"
              checked={row.value}
              onChange={(e) => update({ [row.key]: e.target.checked })}
              className="h-4 w-4 accent-brand-600"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
