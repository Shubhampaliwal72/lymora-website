"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** GSAP owns these outer wrappers; text and tab interactions have separate owners. */
export function HomeScrollMotion({children}: {children: ReactNode}) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const {motion, capable} = useScenePreferences();
  useGSAP(() => {
    if (!motion || !root.current) return;
    const select = gsap.utils.selector(root);
    select("[data-scroll-heading], [data-scroll-item]").forEach((element: Element) => {
      gsap.from(element, {y: capable ? 20 : 10, duration: .7, ease: "power3.out", clearProps: "transform", scrollTrigger: {trigger: element, start: "top 92%", once: true}});
    });
    select("[data-scroll-index]").forEach((element: Element) => {
      gsap.fromTo(element, {y: capable ? 24 : 8}, {y: capable ? -20 : -8, ease: "none", scrollTrigger: {trigger: element.closest("section"), start: "top bottom", end: "bottom top", scrub: 1.1, invalidateOnRefresh: true}});
    });
    select("[data-scroll-surface]").forEach((element: Element) => {
      gsap.from(element, {y: capable ? 28 : 12, duration: .9, ease: "power3.out", clearProps: "transform", scrollTrigger: {trigger: element, start: "top 92%", once: true}});
    });
    gsap.fromTo(progress.current, {scaleX: 0}, {scaleX: 1, ease: "none", scrollTrigger: {trigger: root.current, start: 0, end: () => Math.max(1, document.documentElement.scrollHeight - innerHeight), scrub: .25, invalidateOnRefresh: true}});
    let disposed = false;
    const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
    void document.fonts.ready.then(refresh);
    const images = Array.from(root.current.querySelectorAll("img"));
    images.forEach(image => image.addEventListener("load", refresh));
    return () => { disposed = true; images.forEach(image => image.removeEventListener("load", refresh)); };
  }, {scope: root, dependencies: [motion, capable], revertOnUpdate: true});
  return <main ref={root} id="main" tabIndex={-1} className="homepage-motion"><div ref={progress} className="reading-progress" aria-hidden="true"/>{children}</main>;
}
