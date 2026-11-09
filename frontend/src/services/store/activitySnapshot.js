/**
 * Activity snapshot — a tiny external store.
 *
 * Problem: `useTasks()` / `useSchedule()` fetch on mount and keep their state
 * locally, so two components calling them independently double every request.
 * The layout header wants live counts for the reminder badge, but it must not
 * trigger its own fetch (that would re-fetch on every page).
 *
 * Solution: whichever hook instance has data publishes the latest snapshot
 * here, and read-only consumers (the header badge) subscribe to it. No extra
 * network traffic, and the badge still updates when the page mutates tasks or
 * events.
 */

const EMPTY = { tasks: [], events: [] };

let snapshot = EMPTY;
const listeners = new Set();

/** Publish the latest collections. Call from a hook that already fetched. */
export const publishActivity = (partial) => {
  const next = { ...snapshot, ...partial };
  // Cheap identity check so we don't notify on no-op renders.
  if (next.tasks === snapshot.tasks && next.events === snapshot.events) return;
  snapshot = next;
  listeners.forEach((listener) => listener(snapshot));
};

export const getActivitySnapshot = () => snapshot;

/**
 * Subscribe to the shared snapshot. Used via React's `useSyncExternalStore`,
 * which is built for exactly this case and avoids tearing.
 */
export const subscribeActivity = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Test helper — reset between runs. */
export const resetActivitySnapshot = () => {
  snapshot = EMPTY;
  listeners.forEach((listener) => listener(snapshot));
};
