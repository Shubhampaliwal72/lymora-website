"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { beginNavigation, completeNavigation, navigationKey, navigationServerSnapshot, navigationSnapshot, resetNavigation, subscribeNavigation } from "@/lib/navigation-feedback";

export function NavigationFeedback() {
  const state = useSyncExternalStore(subscribeNavigation, navigationSnapshot, navigationServerSnapshot);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const committed = useRef("");
  useEffect(() => {
    committed.current = navigationKey(location.href);
    completeNavigation(location.href);
  }, [pathname, search]);
  useEffect(() => {
    const history = () => {
      if (navigationKey(location.href) !== committed.current) beginNavigation(location.href, true);
    };
    window.addEventListener("popstate", history);
    window.addEventListener("pagehide", resetNavigation);
    window.addEventListener("pageshow", resetNavigation);
    return () => {
      window.removeEventListener("popstate", history);
      window.removeEventListener("pagehide", resetNavigation);
      window.removeEventListener("pageshow", resetNavigation);
      resetNavigation();
    };
  }, []);
  return <>
    <div className="navigation-progress" data-state={state.phase} data-visible={state.visible} aria-hidden="true"><span/></div>
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{state.visible && state.phase === "pending" ? "Loading page." : ""}</span>
  </>;
}
