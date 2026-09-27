"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, LogOut } from "lucide-react";
import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useAuthStore } from "@/lib/store/auth";
import { useIsClient } from "@/lib/useIsClient";

const EMAIL_KEY = "shf-email-for-sign-in";

function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/my-opportunities";
}

function describeError(err: unknown): string {
  const code = err instanceof FirebaseError ? err.code : "";
  switch (code) {
    case "auth/invalid-action-code":
    case "auth/expired-action-code":
      return "That sign-in link has expired or was already used. Request a new one below.";
    case "auth/invalid-email":
      return "That email address doesn't match the one the link was sent to.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "The Google sign-in window was closed before finishing.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.";
    case "auth/unauthorized-domain":
      return "Sign-in isn't allowed from this web address yet.";
    default:
      return "Something went wrong signing in. Please try again.";
  }
}

function readStoredEmail(): string | null {
  try {
    return window.localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}

function writeStoredEmail(email: string | null) {
  try {
    if (email) window.localStorage.setItem(EMAIL_KEY, email);
    else window.localStorage.removeItem(EMAIL_KEY);
  } catch {
    // Storage unavailable (private mode); the user will be asked to confirm their email instead.
  }
}

export function LoginForm() {
  const auth = getFirebaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const { status, email: signedInEmail } = useAuthStore();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set when this page was opened from the emailed sign-in link. If this
  // browser remembers which address the link went to, sign-in finishes
  // automatically; otherwise (e.g. link opened on another device) the user
  // confirms their email first.
  const mounted = useIsClient();
  const fromEmailLink = mounted && auth ? isSignInWithEmailLink(auth, window.location.href) : false;
  const storedEmail = fromEmailLink ? readStoredEmail() : null;
  const autoCompleting = fromEmailLink && Boolean(storedEmail) && !error;

  useEffect(() => {
    if (!auth || !fromEmailLink || !storedEmail) return;
    signInWithEmailLink(auth, storedEmail, window.location.href)
      .then(() => {
        writeStoredEmail(null);
        router.replace(next);
      })
      .catch((err) => setError(describeError(err)));
  }, [auth, fromEmailLink, storedEmail, next, router]);

  if (!auth || status === "disabled") {
    return <Notice>Sign-in isn&apos;t set up on this site yet. Saved opportunities are kept in this browser.</Notice>;
  }

  if (status === "signedIn") {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-700">
          Signed in as <span className="font-semibold text-foreground">{signedInEmail}</span>. Your saved opportunities
          sync to your account.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => router.push(next)}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Go to My Opportunities
          </button>
          <button
            onClick={() => void signOut(auth)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
    );
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError(null);
    try {
      const url = `${window.location.origin}/login?next=${encodeURIComponent(next)}`;
      await sendSignInLinkToEmail(auth, email, { url, handleCodeInApp: true });
      writeStoredEmail(email);
      setSentTo(email);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirmLink(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      router.replace(next);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (!auth) return;
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.replace(next);
    } catch (err) {
      setError(describeError(err));
    }
  }

  if (autoCompleting) {
    return <Notice>Signing you in...</Notice>;
  }

  if (fromEmailLink && !storedEmail) {
    return (
      <form onSubmit={confirmLink} className="space-y-3 rounded-xl border border-border bg-white p-5 shadow-sm">
        {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</p>}
        <p className="text-sm text-gray-700">To finish signing in, confirm the email address the link was sent to.</p>
        <EmailInput value={email} onChange={setEmail} />
        <SubmitButton busy={busy} label="Finish signing in" />
      </form>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-5 shadow-sm">
      {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</p>}

      <button
        onClick={signInWithGoogle}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        <GoogleIcon /> Continue with Google
      </button>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      {sentTo ? (
        <Notice>
          We sent a sign-in link to <span className="font-semibold text-foreground">{sentTo}</span>. Open it to finish
          signing in. Check your spam folder if it doesn&apos;t arrive within a few minutes.
        </Notice>
      ) : (
        <form onSubmit={sendLink} className="space-y-3">
          <EmailInput value={email} onChange={setEmail} />
          <SubmitButton busy={busy} label="Email me a sign-in link" />
        </form>
      )}
    </div>
  );
}

function EmailInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <>
      <label className="block text-xs font-medium text-muted" htmlFor="email">
        Email address
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
    >
      <Mail size={15} /> {busy ? "Please wait..." : label}
    </button>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-border bg-gray-50 p-4 text-sm text-gray-700">{children}</p>;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
