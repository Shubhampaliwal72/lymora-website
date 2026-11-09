"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Marketing words reveal on entry and replay only after leaving the viewport. */
export function PageRevealMotion({children}: {children: ReactNode}) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const {motion} = useScenePreferences();
  useEffect(() => { document.documentElement.dataset.motion = motion ? "full" : "reduced"; }, [motion]);
  useGSAP(() => {
    if (!motion || !root.current || root.current.querySelector(".reading-page")) return;
    const splits: SplitText[] = [];
    const select = gsap.utils.selector(root);
    const originals = new Map<Element, {html: string; label: string | null}>();
    const remember = (element: Element) => originals.set(element, {html: element.innerHTML, label: element.getAttribute("aria-label")});
    try {
      select("main h2").forEach((heading: Element) => {
        if (heading.closest("dialog")) return;
        remember(heading);
        const split = SplitText.create(heading, {type: "words", tag: "span", wordsClass: "reveal-word", aria: "auto"});
        splits.push(split);
        gsap.from(split.words, {yPercent: 35, opacity: .2, duration: .85, stagger: .04, ease: "power3.out", scrollTrigger: {trigger: heading, start: "top 92%", toggleActions: "play none play reverse"}});
      });
      // Only stable introductory copy is split. Dynamic tab descriptions keep Motion ownership.
      select(".chapter-heading-copy > p, .prose .large-copy").forEach((copy: Element) => {
        remember(copy);
        const split = SplitText.create(copy, {
          type: "lines", linesClass: "reveal-copy-line", aria: "auto", autoSplit: true,
          onSplit: self => gsap.from(self.lines, {y: 14, opacity: .28, duration: .85, stagger: .09, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: {trigger: copy, start: "top 90%", once: true}}),
        });
        splits.push(split);
      });
    } catch {
      // Only static text is split. Restore its original markup if enhancement fails.
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
  }, {scope: root, dependencies: [pathname, motion], revertOnUpdate: true});
  return <div ref={root} className="page-reveal-content">{children}</div>;
}
