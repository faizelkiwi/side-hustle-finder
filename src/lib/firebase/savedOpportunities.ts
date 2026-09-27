"use client";

import { collection, deleteDoc, doc, getDocs, writeBatch, type Firestore } from "firebase/firestore";
import type { SavedOpportunityMeta } from "../types";
import { getFirebaseDb } from "./client";

// Each user's saves live at users/{uid}/savedOpportunities/{opportunityId}.
// firestore.rules only lets a signed-in user read and write their own path.

function requireDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");
  return db;
}

function savedCollection(db: Firestore, userId: string) {
  return collection(db, "users", userId, "savedOpportunities");
}

export async function fetchSavedOpportunities(userId: string): Promise<Record<string, SavedOpportunityMeta>> {
  const snapshot = await getDocs(savedCollection(requireDb(), userId));
  return Object.fromEntries(snapshot.docs.map((d) => [d.id, { ...(d.data() as SavedOpportunityMeta), opportunityId: d.id }]));
}

export async function upsertSavedOpportunities(userId: string, metas: SavedOpportunityMeta[]): Promise<void> {
  if (metas.length === 0) return;
  const db = requireDb();
  const batch = writeBatch(db);
  for (const meta of metas) {
    batch.set(doc(savedCollection(db, userId), meta.opportunityId), meta);
  }
  await batch.commit();
}

export async function deleteSavedOpportunity(userId: string, opportunityId: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(savedCollection(db, userId), opportunityId));
}
