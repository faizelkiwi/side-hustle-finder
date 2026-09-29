"use client";

import { createContext, useContext } from "react";
import type { PlanId } from "@/lib/plans";

export interface ClientAccount {
  uid: string;
  email: string | null;
  name: string | null;
  plan: PlanId;
}

const AccountContext = createContext<ClientAccount | null>(null);

/** Makes the server-verified account (from the (app) layout) available to client components. */
export function AccountProvider({ account, children }: { account: ClientAccount; children: React.ReactNode }) {
  return <AccountContext.Provider value={account}>{children}</AccountContext.Provider>;
}

export function useAccount(): ClientAccount | null {
  return useContext(AccountContext);
}
