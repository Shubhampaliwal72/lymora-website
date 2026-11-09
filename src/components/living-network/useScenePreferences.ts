"use client";

import { useSyncExternalStore } from "react";

type NetworkHints = EventTarget & { saveData?: boolean; effectiveType?: string };
type NavigatorHints = Navigator & { connection?: NetworkHints; deviceMemory?: number };
const queries = {
  capable: "(min-width: 901px) and (hover: hover) and (pointer: fine)",
};
function subscribePreferences(callback: () => void) {
  const media = Object.values(queries).map(query => matchMedia(query));
  media.forEach(query => query.addEventListener("change", callback));
  const connection = (navigator as NavigatorHints).connection;
  connection?.addEventListener("change", callback);
  return () => {
    media.forEach(query => query.removeEventListener("change", callback));
    connection?.removeEventListener("change", callback);
  };
}
function isCapable() {
  const hints = navigator as NavigatorHints;
  return matchMedia(queries.capable).matches && !hints.connection?.saveData
    && !["slow-2g", "2g"].includes(hints.connection?.effectiveType ?? "")
    && (hints.deviceMemory === undefined || hints.deviceMemory >= 4)
    && (hints.hardwareConcurrency === undefined || hints.hardwareConcurrency >= 4);
}
function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});
  const system = matchMedia("(prefers-color-scheme: dark)");
  system.addEventListener("change", callback);
  return () => { observer.disconnect(); system.removeEventListener("change", callback); };
}
function themeSnapshot(): "dark" | "light" {
  const theme = document.documentElement.dataset.theme;
  if (theme === "dark" || theme === "light") return theme;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
export function useScenePreferences() {
  return {
    capable: useSyncExternalStore(subscribePreferences, isCapable, () => false),
    // Owner-approved brand motion stays enabled, including after hydration/refresh.
    // Navigation-only reduced-motion rules live in navigation.css; do not gate scenes here.
    motion: true,
    theme: useSyncExternalStore(subscribeTheme, themeSnapshot, () => "light" as const),
    visible: useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true),
  };
}
