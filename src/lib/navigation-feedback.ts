"use client";

// A small external store updates only the indicator, not the page or navigation tree.
const idle = {phase: "idle", visible: false} as const;
type Snapshot = {phase: "idle" | "pending" | "complete"; visible: boolean};
let snapshot: Snapshot = idle;
let generation = 0;
let active = 0;
let destination = "";
const listeners = new Set<() => void>();
let reveal: ReturnType<typeof setTimeout> | undefined;
let expiry: ReturnType<typeof setTimeout> | undefined;
let dismissal: ReturnType<typeof setTimeout> | undefined;

export function navigationKey(href: string) {
  const url = new URL(href, window.location.href);
  return url.pathname.replace(/\/$/, "") + url.search;
}
const publish = (next: Snapshot) => {snapshot = next; listeners.forEach(listener => listener());};
const clearTimers = () => {clearTimeout(reveal); clearTimeout(expiry); clearTimeout(dismissal);};
export const subscribeNavigation = (listener: () => void) => {listeners.add(listener); return () => {listeners.delete(listener);};};
export const navigationSnapshot = () => snapshot;
export const navigationServerSnapshot = () => idle;

export function resetNavigation() {
  clearTimers(); active = 0; destination = ""; publish(idle);
}
function finish(id: number) {
  if (!id || id !== active) return;
  clearTimers(); active = 0; destination = "";
  if (!snapshot.visible) {publish(idle); return;}
  publish({phase: "complete", visible: true});
  dismissal = setTimeout(() => publish(idle), 180);
}
export function completeNavigation(href: string) {
  if (navigationKey(href) === destination) finish(active);
}

/** Returns a request-specific cleanup so an older cancelled link cannot end a newer one. */
export function beginNavigation(href: string, history = false) {
  const url = new URL(href, window.location.href);
  if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return () => {};
  const key = navigationKey(href);
  if (!history && key === navigationKey(location.href)) return () => {};
  clearTimers();
  const id = ++generation;
  active = id; destination = key;
  publish({phase: "pending", visible: snapshot.visible});
  // Suppress flashes for cached transitions. This never delays the router.
  reveal = setTimeout(() => {if (active === id) publish({phase: "pending", visible: true});}, 100);
  // Recovery for a failed/stalled transition; do not claim it successfully loaded.
  expiry = setTimeout(() => {if (active === id) resetNavigation();}, 15000);
  return () => finish(id);
}
