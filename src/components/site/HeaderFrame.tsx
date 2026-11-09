"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** One visibility observer, rather than a scroll listener or per-frame React updates. */
export function HeaderFrame({children}: {children: ReactNode}) {
  const marker = useRef<HTMLSpanElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!marker.current || !header.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      header.current?.setAttribute("data-compact", String(!entry.isIntersecting));
    }, {rootMargin: "64px 0px 0px 0px"});
    observer.observe(marker.current);
    return () => observer.disconnect();
  }, []);
  return <><span ref={marker} className="header-scroll-marker" aria-hidden="true"/><header ref={header} className="site-header glass-header">{children}</header></>;
}
