"use client";

import { useEffect } from "react";

/** Event delegation gives site controls immediate, disposable press feedback. */
export function ButtonRipple() {
  useEffect(() => {
    const animations = new Set<Animation>();
    const ripples = new Set<HTMLElement>();
    const animateRipple = (control: HTMLElement, x: number, y: number) => {
      if (control.matches(":disabled,[aria-disabled='true']")) return;
      const bounds = control.getBoundingClientRect();
      const diameter = Math.max(bounds.width, bounds.height) * 2;
      const ripple = document.createElement("span");
      ripple.className = "button-click-ripple";
      ripple.setAttribute("aria-hidden", "true");
      Object.assign(ripple.style, {width: `${diameter}px`, height: `${diameter}px`, left: `${x}px`, top: `${y}px`});
      control.append(ripple);
      ripples.add(ripple);
      const reduced = document.documentElement.dataset.motion === "reduced";
      const animation = ripple.animate(reduced
        ? [{opacity: .18}, {opacity: 0}]
        : [{transform: "translate(-50%,-50%) scale(.05)", opacity: .65}, {transform: "translate(-50%,-50%) scale(1)", opacity: 0}],
        {duration: reduced ? 140 : 520, easing: "cubic-bezier(.16,1,.3,1)"});
      animations.add(animation);
      void animation.finished.catch(() => {}).finally(() => {
        ripple.remove(); ripples.delete(ripple); animations.delete(animation);
      });
    };
    const controlFor = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>(".site-shell :is(.button,button:not(.network-device-label),[role='tab'])");
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary) return;
      const control = controlFor(event.target);
      if (!control) return;
      const bounds = control.getBoundingClientRect();
      animateRipple(control, event.clientX - bounds.left, event.clientY - bounds.top);
    };
    const click = (event: MouseEvent) => {
      // Pointer presses already receive immediate feedback; detail 0 covers keyboard activation.
      if (event.detail !== 0) return;
      const control = controlFor(event.target);
      if (!control) return;
      const bounds = control.getBoundingClientRect();
      animateRipple(control, bounds.width / 2, bounds.height / 2);
    };
    document.addEventListener("pointerdown", pointerDown);
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("click", click);
      animations.forEach(animation => animation.cancel());
      ripples.forEach(ripple => ripple.remove());
    };
  }, []);
  return null;
}