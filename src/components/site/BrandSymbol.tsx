"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Owner-approved ambient logo motion; CSS owns every animated property. */
export function BrandSymbol({children}: {children: ReactNode}) {
  const symbol = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = symbol.current;
    if (!element) return;
    let visible = true;
    const sync = () => { element.dataset.paused = String(document.hidden || !visible); };
    element.dataset.live = "true";
    sync();
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer?.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      delete element.dataset.live;
      delete element.dataset.paused;
    };
  }, []);
  return <span ref={symbol} className="brand-symbol">{children}</span>;
}
