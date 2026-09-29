import { Suspense } from "react";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Sign up · Side Hustle Finder" };

export default function SignupPage() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">Create your free account</h1>
        <p className="mt-1 text-sm text-muted">Find legitimate side hustles and track the ones you go after.</p>
      </div>
      <Suspense>
        <SignupForm />
      </Suspense>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
