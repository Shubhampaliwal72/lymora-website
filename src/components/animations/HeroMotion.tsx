"use client";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";
import { motionTiming } from "@/lib/motion";
gsap.registerPlugin(useGSAP);
export function HeroMotion({children}: {children: ReactNode}) {
  const root = useRef<HTMLDivElement>(null);
  const {motion,capable}=useScenePreferences();
  useGSAP(() => {
    if(!motion)return;
      gsap.from("[data-hero-reveal]", {y: capable?24:12, rotationX: capable?14:0, z: capable?-18:0, transformPerspective:1100, opacity: .8, duration: motionTiming.entrance, stagger: motionTiming.stagger, ease: "power3.out", clearProps: "transform,opacity"});
  }, {scope: root,dependencies:[motion,capable],revertOnUpdate:true});
  return <div ref={root} className="hero-copy">{children}</div>;
}
