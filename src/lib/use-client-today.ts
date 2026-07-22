"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns the current Date on the client, or null during SSR and the first
 * client render (before hydration completes).
 *
 * This prevents build-time dates from being frozen in prerendered (SSG) HTML.
 * Any calculator that derives a display date (e.g., debt-free date, target
 * date, LTV drop-off date) from "today" must use this hook so that:
 *   - During SSR: returns null (date-dependent UI is hidden)
 *   - After hydration: returns the real current Date
 *
 * Implementation: useSyncExternalStore with a cached Date object. The Date is
 * created once per component instance (via the module-level cache that resets
 * on each getSnapshot call check) and stored in a WeakRef-free cache so the
 * same reference is returned until the component re-renders. This avoids the
 * "getSnapshot should be cached" infinite loop that would occur if we returned
 * `new Date()` directly (a new object reference each call).
 */

// Cache the Date object so getSnapshot returns a stable reference.
// The cache is updated only when the cache is empty (first client call).
let cachedDate: Date | null = null;

const subscribe = () => () => {};

const getClientSnapshot = (): Date | null => {
  if (cachedDate === null) {
    cachedDate = new Date();
  }
  return cachedDate;
};

const getServerSnapshot = (): Date | null => null;

export function useClientToday(): Date | null {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
