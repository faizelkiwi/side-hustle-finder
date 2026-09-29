import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Briefcase size={18} />
        </div>
        <span className="text-base font-semibold text-foreground">Side Hustle Finder</span>
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
}
