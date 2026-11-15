"use client";

import { useEffect } from "react";

/** Event delegation covers header controls without wrapping links or delaying navigation. */
export function HeaderRipple() {
  useEffect(() => {
    const animations = new Set<Animation>();
    const ripples = new Set<HTMLElement>();
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest<HTMLElement>(".header-actions :is(.button,.icon-button,summary)");
      if (!control || control.matches(":disabled,[aria-disabled='true']")) return;
      const bounds = control.getBoundingClientRect();
      const diameter = Math.max(bounds.width, bounds.height) * 2;
      // Synthetic/keyboard activations originate at the center, pointer activations at the click.
      const x = event.detail ? event.clientX - bounds.left : bounds.width / 2;
      const y = event.detail ? event.clientY - bounds.top : bounds.height / 2;
      const ripple = document.createElement("span");
      ripple.className = "header-click-ripple";
      ripple.setAttribute("aria-hidden", "true");
      Object.assign(ripple.style, {width: `${diameter}px`, height: `${diameter}px`, left: `${x}px`, top: `${y}px`});
      control.append(ripple);
      ripples.add(ripple);
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const animation = ripple.animate(reduced
        ? [{opacity: .18}, {opacity: 0}]
        : [{transform: "translate(-50%,-50%) scale(.05)", opacity: .65}, {transform: "translate(-50%,-50%) scale(1)", opacity: 0}],
        {duration: reduced ? 140 : 650, easing: "cubic-bezier(.16,1,.3,1)"});
      animations.add(animation);
      void animation.finished.catch(() => {}).finally(() => {
        ripple.remove(); ripples.delete(ripple); animations.delete(animation);
      });
    };
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("click", click);
      animations.forEach(animation => animation.cancel());
      ripples.forEach(ripple => ripple.remove());
    };
  }, []);
  return null;
}
