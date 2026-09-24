import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * True once the component has hydrated on the client. Used to gate reads
 * from localStorage-backed stores (saved opportunities, settings) so the
 * server-rendered HTML matches the client's first paint exactly.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
