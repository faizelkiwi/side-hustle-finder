"use client";

import { create } from "zustand";

export type AuthStatus = "loading" | "signedIn" | "signedOut" | "disabled";

interface AuthState {
  status: AuthStatus;
  email: string | null;
  setAuth: (status: AuthStatus, email?: string | null) => void;
}

/** Current sign-in state, kept up to date by <AuthSync />. */
export const useAuthStore = create<AuthState>()((set) => ({
  status: "loading",
  email: null,
  setAuth: (status, email = null) => set({ status, email }),
}));
