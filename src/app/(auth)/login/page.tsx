import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Log in · Side Hustle Finder" };

export default function LoginPage() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to your Side Hustle Finder account.</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
          Create a free account
        </Link>
      </p>
    </div>
  );
}
