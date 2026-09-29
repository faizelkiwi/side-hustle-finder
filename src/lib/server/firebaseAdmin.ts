import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// FIREBASE_SERVICE_ACCOUNT_KEY holds the service-account JSON, base64-encoded
// so it survives being pasted into env-var UIs without newline issues.
function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
  return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
}

function getAdminApp(): App {
  return getApps()[0] ?? initializeApp({ credential: cert(loadServiceAccount()) });
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());
