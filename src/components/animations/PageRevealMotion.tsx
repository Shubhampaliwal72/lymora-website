"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
/** Words, paragraphs and screenshot content have separate owners from the
 * homepage's outer parallax wrappers and Motion's tab transitions. */
export function PageRevealMotion({children}:{children:ReactNode}) {
  const root=useRef<HTMLDivElement>(null), pathname=usePathname();
  const {motion,capable}=useScenePreferences();
  useGSAP(()=>{
    if(!motion||!root.current)return;
    const select=gsap.utils.selector(root);
    const splits:SplitText[]=[];
    select("main h2, main .page-intro h1").forEach((heading:Element)=>{
      const split=SplitText.create(heading,{type:"words",tag:"span",wordsClass:"reveal-word",aria:"auto"});splits.push(split);
      gsap.from(split.words,{yPercent:70,opacity:.08,rotationX:capable?-18:0,duration:.85,stagger:.045,ease:"power3.out",scrollTrigger:{trigger:heading,start:"top 88%",once:true}});
    });
    select(".theme-screenshot").forEach((image:Element)=>gsap.from(image,{y:capable?42:20,scale:.94,opacity:.15,duration:1.1,ease:"power3.out",scrollTrigger:{trigger:image.parentElement,start:"top 87%",once:true}}));
    select("main section > p, .page-lead, .prose > p, .product-stage-copy > p, .connection-instructions li > div, .usecase-list > div > p").forEach((copy:Element)=>gsap.from(copy,{y:20,opacity:.15,duration:.75,ease:"power2.out",scrollTrigger:{trigger:copy,start:"top 90%",once:true}}));
    let disposed=false;
    const refresh=()=>{if(!disposed)ScrollTrigger.refresh();};
    void document.fonts.ready.then(refresh);
    const images=Array.from(root.current.querySelectorAll("img"));images.forEach(image=>image.addEventListener("load",refresh));
    return()=>{disposed=true;images.forEach(image=>image.removeEventListener("load",refresh));splits.forEach(split=>split.revert());};
  },{scope:root,dependencies:[pathname,motion,capable],revertOnUpdate:true});
  return <div ref={root} className="page-reveal-content">{children}</div>;
}
