"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { establishSession } from "@/lib/firebase/session";
import {
  ErrorNote,
  Field,
  GoogleButton,
  Notice,
  OrDivider,
  PrimaryButton,
  describeAuthError,
  safeNext,
  signInWithGoogle,
} from "./authShared";

export function SignupForm() {
  const auth = getFirebaseAuth();
  const next = safeNext(useSearchParams().get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!auth) {
    return <Notice>Sign-up isn&apos;t available right now. Please try again later.</Notice>;
  }

  async function withGoogle() {
    if (!auth) return;
    setBusy(true);
    setError(null);
    try {
      await establishSession(await signInWithGoogle(auth));
      window.location.assign(next);
    } catch (err) {
      setError(describeAuthError(err));
      setBusy(false);
    }
  }

  async function withPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name.trim() });
      // Verification is encouraged but not required to use the app.
      void sendEmailVerification(user).catch(() => undefined);
      await establishSession(user);
      window.location.assign(next);
    } catch (err) {
      setError(describeAuthError(err));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <ErrorNote message={error} />
      <GoogleButton disabled={busy} label="Sign up with Google" onClick={() => void withGoogle()} />
      <OrDivider />
      <form onSubmit={withPassword} className="space-y-3">
        <Field id="name" label="Your name" autoComplete="name" value={name} onChange={setName} placeholder="Thandi Mokoena" />
        <Field id="email" label="Email address" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
        />
        <PrimaryButton busy={busy}>
          <UserPlus size={15} /> Create free account
        </PrimaryButton>
      </form>
      <p className="text-center text-xs text-muted">
        By creating an account you agree to use opportunity information as guidance only and to verify listings yourself.
      </p>
    </div>
  );
}
