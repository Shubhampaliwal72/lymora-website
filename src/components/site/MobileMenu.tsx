"use client";
import { useEffect, useRef } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { motionTiming } from "@/lib/motion";
import { Icon } from "./Icons";
export function MobileMenu() {
  const details = useRef<HTMLDetailsElement>(null);
  const [panel, animate] = useAnimate<HTMLElement>();
  const reduce = useReducedMotion();
  useEffect(() => {
    const close = () => { if (details.current) details.current.open = false; };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.current?.open) {
        close(); details.current.querySelector("summary")?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.current?.contains(event.target)) close();
    };
    const wide = matchMedia("(min-width: 901px)");
    const resize = () => { if (wide.matches) close(); };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    wide.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      wide.removeEventListener("change", resize);
    };
  }, []);
  return <details ref={details} className="mobile-menu" onToggle={(event) => { if (event.currentTarget.open && panel.current) void animate(panel.current, {opacity: [reduce ? 1 : .75, 1], y: [reduce ? 0 : -6, 0]}, {duration: reduce ? 0 : motionTiming.menu}); }}>
    <summary className="icon-button" aria-label="Navigation menu" aria-controls="mobile-navigation"><Icon name="menu" className="menu-bars"/><Icon name="close" className="menu-close"/></summary>
    <nav ref={panel} id="mobile-navigation" className="mobile-panel" aria-label="Mobile navigation" onClick={(event) => { if ((event.target as HTMLElement).closest("a") && details.current) details.current.open = false; }}>
      <a href="#the-app">The app</a><a href="#how-it-works">How it works</a><a href="#getting-started">Getting started</a><a href="#download" className="mobile-download">Windows download ↗</a>
    </nav>
  </details>;
}
