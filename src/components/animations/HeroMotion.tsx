"use client";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";
import { motionTiming } from "@/lib/motion";
gsap.registerPlugin(useGSAP);
export function HeroMotion({children}: {children: ReactNode}) {
  const root = useRef<HTMLDivElement>(null);
  const {motion}=useScenePreferences();
  useGSAP(() => {
    if(!motion)return;
      gsap.from("[data-hero-reveal]", {y: 16, opacity: .65, duration: motionTiming.entrance, stagger: motionTiming.stagger, ease: "power3.out", clearProps: "transform,opacity"});
  }, {scope: root,dependencies:[motion],revertOnUpdate:true});
  return <div ref={root} className="hero-copy">{children}</div>;
}
