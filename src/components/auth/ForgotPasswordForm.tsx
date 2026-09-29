"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { ErrorNote, Field, Notice, PrimaryButton, describeAuthError } from "./authShared";

export function ForgotPasswordForm() {
  const auth = getFirebaseAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!auth) return <Notice>Password reset isn&apos;t available right now. Please try again later.</Notice>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/login` });
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists for this email.
      if (err instanceof FirebaseError && err.code === "auth/user-not-found") setSent(true);
      else setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <Notice>
        If an account exists for <span className="font-semibold text-foreground">{email}</span>, we&apos;ve emailed a
        link to reset your password. Check your spam folder if it doesn&apos;t arrive within a few minutes.
      </Notice>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <ErrorNote message={error} />
      <Field id="email" label="Email address" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <PrimaryButton busy={busy}>
        <Mail size={15} /> Send reset link
      </PrimaryButton>
    </form>
  );
}
