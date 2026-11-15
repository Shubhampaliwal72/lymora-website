"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
const surfaceSelector = ".site-shell :is(.glass-panel,.gloss-surface,.connection-bubble,.download-integrity,.button,.icon-button,.footer-orbit,button:not(.screenshot-trigger)), .ambience-control";

/** Shared surfaces and text enhancement; no per-scroll React renders or hidden static copy. */
export function PageRevealMotion({children}: {children: ReactNode}) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const {motion, capable, visible} = useScenePreferences();
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "full" : "reduced";
    document.documentElement.dataset.sceneVisible = String(visible);
  }, [motion, visible]);
  useEffect(() => {
    const tracked = new Set<HTMLElement>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { (entry.target as HTMLElement).dataset.edgeVisible = String(entry.isIntersecting); });
    }, {rootMargin: "20px"});
    const collect = () => document.querySelectorAll<HTMLElement>(surfaceSelector).forEach(element => {
      if (tracked.has(element)) return;
      tracked.add(element);
      element.dataset.edgeSurface = "";
      if (getComputedStyle(element).position === "static") element.dataset.edgePosition = "relative";
      observer.observe(element);
    });
    collect();
    // Screenshot tabs and FAQ filtering can insert new controls without a route change.
    const mutations = new MutationObserver(collect);
    if (root.current) mutations.observe(root.current, {childList: true, subtree: true});
    return () => {
      mutations.disconnect();observer.disconnect();
      tracked.forEach(element => {delete element.dataset.edgeSurface;delete element.dataset.edgeVisible;delete element.dataset.edgePosition;});
    };
  }, [pathname]);
  useGSAP(() => {
    if (!motion || !root.current) return;
    const splits: SplitText[] = [];
    const select = gsap.utils.selector(root);
    const originals = new Map<Element, {html: string; label: string | null}>();
    const remember = (element: Element) => originals.set(element, {html: element.innerHTML, label: element.getAttribute("aria-label")});
    try {
      select("main h2, .footer-statement h2").forEach((heading: Element) => {
        if (heading.closest("dialog, .reading-page .prose")) return;
        remember(heading);
        const split = SplitText.create(heading, {type: "words", tag: "span", wordsClass: "reveal-word", aria: "auto"});
        splits.push(split);
        gsap.fromTo(split.words,
          {yPercent: capable ? 32 : 14, rotationX: capable ? 42 : 0, z: capable ? -24 : 0, opacity: .42, transformPerspective: 900},
          {yPercent: 0, rotationX: 0, z: 0, opacity: 1, stagger: .035, ease: "power2.out",
            scrollTrigger: {trigger: heading, start: "top 95%", end: "top 63%", scrub: .5, invalidateOnRefresh: true}});
      });
      select(".page-intro h1").forEach((heading: Element) => {
        remember(heading);
        const split = SplitText.create(heading, {type: "words", tag: "span", wordsClass: "reveal-word", aria: "auto"});
        splits.push(split);
        gsap.from(split.words, {yPercent: 20, rotationX: capable ? 25 : 0, opacity: .65, transformPerspective: 900,
          duration: .75, stagger: .035, ease: "power3.out", clearProps: "transform,opacity"});
      });
      // Stable introductory copy only. Interactive FAQ answers and tab descriptions keep their owners.
      select(".chapter-heading-copy > p, .prose .large-copy").forEach((copy: Element) => {
        remember(copy);
        const split = SplitText.create(copy, {
          type: "lines", linesClass: "reveal-copy-line", aria: "auto", autoSplit: true,
          onSplit: self => gsap.fromTo(self.lines, {y: capable ? 15 : 6, opacity: .6, rotationX: capable ? 12 : 0, transformPerspective: 900},
            {y: 0, opacity: 1, rotationX: 0, stagger: .08, ease: "power2.out", scrollTrigger: {trigger: copy, start: "top 96%", end: "top 70%", scrub: .45, invalidateOnRefresh: true}}),
        });
        splits.push(split);
      });
      select(".tonal-wordmark").forEach((element: Element) => {
        gsap.fromTo(element, {"--wordmark-sweep": "0%", rotationX: capable ? 9 : 0, transformPerspective: 1200},
          {"--wordmark-sweep": "100%", rotationX: 0, ease: "none", scrollTrigger: {trigger: element, start: "top 100%", end: "bottom 90%", scrub: .65, invalidateOnRefresh: true}});
      });
    } catch {
      splits.forEach(split => split.revert());
      originals.forEach((original, element) => {
        element.innerHTML = original.html;
        if (original.label === null) element.removeAttribute("aria-label");
        else element.setAttribute("aria-label", original.label);
      });
      return;
    }
    let disposed = false;
    const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
    void document.fonts.ready.then(refresh);
    const images = Array.from(root.current.querySelectorAll("img"));
    images.forEach(image => image.addEventListener("load", refresh));
    return () => { disposed = true; images.forEach(image => image.removeEventListener("load", refresh)); splits.forEach(split => split.revert()); };
  }, {scope: root, dependencies: [pathname, motion, capable], revertOnUpdate: true});
  return <div ref={root} className="page-reveal-content">{children}</div>;
}
