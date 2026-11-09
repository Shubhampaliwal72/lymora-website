"use client";

import type { ReactNode } from "react";

/** A single complete flip; leaving hover does not interrupt the return to rest. */
export function BrandSymbol({children}: {children: ReactNode}) {
  return <span className="brand-symbol" onPointerEnter={event => {
    if (event.pointerType === "touch") return;
    event.currentTarget.dataset.flipping = "true";
  }} onAnimationEnd={event => {
    if (event.target === event.currentTarget && (event.animationName === "brand-symbol-flip" || event.animationName === "brand-symbol-reduced")) {
      delete event.currentTarget.dataset.flipping;
    }
  }}>{children}</span>;
}
