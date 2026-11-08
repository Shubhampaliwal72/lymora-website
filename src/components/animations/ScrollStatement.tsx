"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const phrases = ["Work nearby.", "Think together.", "Keep it local."];

/** A vertical reading sequence driven by normal scrolling, without pinning the page. */
export function ScrollStatement() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const {motion} = useScenePreferences();
  useGSAP(() => {
    if (!motion || !root.current || !track.current) return;
    const rowHeight = () => track.current?.firstElementChild?.getBoundingClientRect().height ?? 0;
    const timeline = gsap.timeline({
      scrollTrigger: {trigger: root.current, start: "top 82%", end: "top 26%", scrub: .65, invalidateOnRefresh: true},
      onUpdate: () => { if (root.current) root.current.dataset.active = String(timeline.progress() < .3 ? 0 : timeline.progress() < .72 ? 1 : 2); },
    });
    timeline.fromTo(track.current, {y: 0}, {y: 0, duration: .18, ease: "none"})
      .to(track.current, {y: () => -rowHeight(), duration: .24, ease: "power2.inOut"})
      .to(track.current, {y: () => -rowHeight(), duration: .18, ease: "none"})
      .to(track.current, {y: () => -rowHeight() * 2, duration: .24, ease: "power2.inOut"})
      .to(track.current, {y: () => -rowHeight() * 2, duration: .16, ease: "none"});
    let disposed = false;
    void document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; };
  }, {scope: root, dependencies: [motion], revertOnUpdate: true});
  return <div ref={root} className="network-ribbon scroll-statement" data-active="0" role="group" aria-label={phrases.join(" ")}>
    <div className="statement-window" aria-hidden="true"><div ref={track} className="statement-track">{phrases.map((phrase, index) => <p key={phrase} className="statement-phrase" data-tone={index === 1 ? "ember" : index === 2 ? "warm" : "neutral"}>{phrase}</p>)}</div></div>
    <div className="statement-progress" aria-hidden="true">{phrases.map(phrase => <span key={phrase}/>)}</div>
    <noscript><style>{".scroll-statement .statement-window{height:auto;overflow:visible}.scroll-statement .statement-track{transform:none!important}.scroll-statement .statement-progress{display:none}"}</style></noscript>
  </div>;
}
