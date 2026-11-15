"use client";

import { useEffect, type ReactNode } from "react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";
import { useAnimate } from "motion/react-mini";

/** Enhance only small guide landmarks; static text is always visible without motion. */
export function DocumentationMotion({children}: {children: ReactNode}) {
  const {motion} = useScenePreferences();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  useEffect(() => {
    if (!scope.current || !motion) return;
    const animations: ReturnType<typeof animate>[] = [];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animations.push(animate(entry.target as HTMLElement, {opacity: [.75, 1], transform: ["translateY(12px)", "translateY(0px)"]}, {duration: .42, ease: [.22, 1, .36, 1]}));
        observer.unobserve(entry.target);
      }
    }, {threshold: .12});
    const landmarks = Array.from(scope.current.querySelectorAll<HTMLElement>("[data-guide-reveal]"));
    landmarks.forEach(item => observer.observe(item));
    return () => {
      observer.disconnect();animations.forEach(animation => animation.stop());
      landmarks.forEach(item => {item.style.removeProperty("transform");item.style.removeProperty("opacity");});
    };
  }, [scope, animate, motion]);
  return <div ref={scope} className="documentation-content">{children}</div>;
}
