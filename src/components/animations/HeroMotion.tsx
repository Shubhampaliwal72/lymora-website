"use client";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTiming } from "@/lib/motion";
gsap.registerPlugin(useGSAP);
export function HeroMotion({children}: {children: ReactNode}) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-hero-reveal]", {y: 16, opacity: .65, duration: motionTiming.entrance, stagger: motionTiming.stagger, ease: "power3.out", clearProps: "transform,opacity"});
    });
    return () => media.revert();
  }, {scope: root});
  return <div ref={root} className="hero-copy">{children}</div>;
}
