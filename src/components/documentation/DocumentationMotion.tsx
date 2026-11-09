"use client";

import { useEffect, type ReactNode } from "react";
import { useAnimate } from "motion/react-mini";

/** Enhance only small guide landmarks; static text is always visible without motion. */
export function DocumentationMotion({children}: {children: ReactNode}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  useEffect(() => {
    if (!scope.current) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        void animate(entry.target as HTMLElement, {opacity: [.75, 1], transform: ["translateY(12px)", "translateY(0px)"]}, {duration: .42, ease: [.22, 1, .36, 1]});
        observer.unobserve(entry.target);
      }
    }, {threshold: .12});
    scope.current.querySelectorAll<HTMLElement>("[data-guide-reveal]").forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [scope, animate]);
  return <div ref={scope} className="documentation-content">{children}</div>;
}
