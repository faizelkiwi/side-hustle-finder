"use client";

import { create } from "zustand";

export type AuthStatus = "loading" | "signedIn" | "signedOut" | "disabled";

interface AuthState {
  status: AuthStatus;
  uid: string | null;
  email: string | null;
  setAuth: (status: AuthStatus, user?: { uid: string; email: string | null } | null) => void;
}

/** Current Firebase sign-in state in this browser, kept up to date by <AuthSync />. */
export const useAuthStore = create<AuthState>()((set) => ({
  status: "loading",
  uid: null,
  email: null,
  setAuth: (status, user = null) => set({ status, uid: user?.uid ?? null, email: user?.email ?? null }),
}));
