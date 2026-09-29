"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, KeyRound } from "lucide-react";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { endSession, establishSession } from "@/lib/firebase/session";
import { useAuthStore } from "@/lib/store/auth";
import { useIsClient } from "@/lib/useIsClient";
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

const EMAIL_KEY = "shf-email-for-sign-in";

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
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const status = useAuthStore((s) => s.status);
  const [mode, setMode] = useState<"password" | "link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeFailed, setResumeFailed] = useState(false);
  // Set once any sign-in flow starts, so the automatic resume below doesn't run twice.
  const started = useRef(false);

  const mounted = useIsClient();
  const fromEmailLink = mounted && auth ? isSignInWithEmailLink(auth, window.location.href) : false;
  const storedEmail = fromEmailLink ? readStoredEmail() : null;

  async function finish(user: User) {
    await establishSession(user);
    window.location.assign(next);
  }

  async function run(action: () => Promise<User>) {
    started.current = true;
    setBusy(true);
    setError(null);
    try {
      await finish(await action());
    } catch (err) {
      setError(describeAuthError(err));
      setBusy(false);
    }
  }

  // Arrived from the emailed sign-in link and this browser remembers the address: finish automatically.
  useEffect(() => {
    if (!auth || !fromEmailLink || !storedEmail || started.current) return;
    started.current = true;
    signInWithEmailLink(auth, storedEmail, window.location.href)
      .then(async ({ user }) => {
        writeStoredEmail(null);
        await finish(user);
      })
      .catch((err) => setError(describeAuthError(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per link visit
  }, [auth, fromEmailLink, storedEmail]);

  // Still signed in to Firebase from an earlier visit but the server session
  // expired: renew it quietly. If the sign-in is too old to renew, sign out
  // and show the form.
  useEffect(() => {
    if (!auth?.currentUser || status !== "signedIn" || fromEmailLink || started.current) return;
    started.current = true;
    finish(auth.currentUser).catch(async () => {
      await endSession();
      setResumeFailed(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once when the stored sign-in is detected
  }, [auth, status, fromEmailLink]);

  if (!auth || status === "disabled") {
    return <Notice>Sign-in isn&apos;t available right now. Please try again later.</Notice>;
  }

  if (status === "loading") {
    return <Notice>Loading...</Notice>;
  }

  if (status === "signedIn" && !resumeFailed && !error) {
    return <Notice>Signing you in...</Notice>;
  }

  if (fromEmailLink && storedEmail && !error) {
    return <Notice>Signing you in...</Notice>;
  }

  if (fromEmailLink && !storedEmail) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => (await signInWithEmailLink(auth, email, window.location.href)).user);
        }}
        className="space-y-3"
      >
        <ErrorNote message={error} />
        <p className="text-sm text-gray-700">To finish signing in, confirm the email address the link was sent to.</p>
        <Field id="email" label="Email address" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <PrimaryButton busy={busy}>Finish signing in</PrimaryButton>
      </form>
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
      setLinkSentTo(email);
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <ErrorNote message={error} />

      <GoogleButton disabled={busy} onClick={() => void run(() => signInWithGoogle(auth))} />
      <OrDivider />

      {mode === "password" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => (await signInWithEmailAndPassword(auth, email, password)).user);
          }}
          className="space-y-3"
        >
          <Field id="email" label="Email address" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            trailing={
              <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            }
          />
          <PrimaryButton busy={busy}>
            <KeyRound size={15} /> Log in
          </PrimaryButton>
        </form>
      ) : linkSentTo ? (
        <Notice>
          We sent a sign-in link to <span className="font-semibold text-foreground">{linkSentTo}</span>. Open it to
          finish signing in. Check your spam folder if it doesn&apos;t arrive within a few minutes.
        </Notice>
      ) : (
        <form onSubmit={sendLink} className="space-y-3">
          <Field id="email" label="Email address" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <PrimaryButton busy={busy}>
            <Mail size={15} /> Email me a sign-in link
          </PrimaryButton>
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          setMode(mode === "password" ? "link" : "password");
          setError(null);
          setLinkSentTo(null);
        }}
        className="w-full text-center text-xs font-medium text-muted hover:text-foreground"
      >
        {mode === "password" ? "Prefer no password? Email me a sign-in link instead" : "Use my password instead"}
      </button>
    </div>
  );
}
