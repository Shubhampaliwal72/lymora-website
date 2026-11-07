"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Server-rendered content stays visible. GSAP owns only the marked wrappers. */
export function HomeScrollMotion({children}:{children:ReactNode}){
  const root=useRef<HTMLElement>(null), progress=useRef<HTMLDivElement>(null);
  const preferences=useScenePreferences();
  useGSAP(()=>{
    if(!preferences.motion||!root.current)return;
    const select=gsap.utils.selector(root);
    const desktop=preferences.capable;
    const reveal=(element:Element,axis:"x"|"y",distance:number)=>gsap.fromTo(element,{[axis]:distance},{[axis]:0,ease:"none",scrollTrigger:{trigger:element,start:"top 94%",end:"top 66%",scrub:.65,invalidateOnRefresh:true}});
    select("[data-scroll-heading]").forEach((element:Element)=>reveal(element,"y",desktop?35:16));
    select("[data-scroll-horizontal]").forEach((element:Element,index:number)=>reveal(element,"x",(index%2?-1:1)*(desktop?45:12)));
    select("[data-scroll-surface]").forEach((element:Element)=>{
      const section=element.closest("section");
      gsap.fromTo(element,{y:desktop?55:18,rotationX:desktop?7:0,rotationY:desktop?-5:0,scale:desktop ? .96 : 1},{y:0,rotationX:0,rotationY:0,scale:1,ease:"none",scrollTrigger:{trigger:section,start:"top 85%",end:"top 22%",scrub:.85,invalidateOnRefresh:true}});
    });
    select("[data-scroll-depth]").forEach((element:Element)=>gsap.fromTo(element,{y:desktop?55:12},{y:desktop?-45:-12,ease:"none",scrollTrigger:{trigger:element.closest("section"),start:"top bottom",end:"bottom top",scrub:1,invalidateOnRefresh:true}}));
    select("[data-scroll-ribbon]").forEach((element:Element)=>{
      const finish=()=>-Math.max(0,element.scrollWidth-(element.parentElement?.clientWidth??0));
      gsap.timeline({scrollTrigger:{trigger:element.parentElement,start:"top 85%",end:"top 35%",scrub:.4,invalidateOnRefresh:true}})
        .fromTo(element,{x:0},{x:0,duration:.18,ease:"none"})
        .to(element,{x:finish,duration:.6,ease:"none"})
        .to(element,{x:finish,duration:.22,ease:"none"});
    });
    select("[data-scroll-wire]").forEach((element:Element)=>gsap.fromTo(element,{"--wire-progress":0},{"--wire-progress":1,ease:"none",scrollTrigger:{trigger:element,start:"top 85%",end:"top 38%",scrub:.7}}));
    if(desktop){
      const scene=select(".brand-hero .living-network")[0];
      if(scene)gsap.to(scene,{y:-34,ease:"none",scrollTrigger:{trigger:root.current,start:"top top",end:"+=850",scrub:1}});
    }
    gsap.fromTo(progress.current,{scaleX:0},{scaleX:1,ease:"none",scrollTrigger:{trigger:root.current,start:0,end:()=>Math.max(1,document.documentElement.scrollHeight-innerHeight),scrub:.25,invalidateOnRefresh:true}});
    let disposed=false;
    const ready=()=>{if(!disposed)ScrollTrigger.refresh();};
    void document.fonts.ready.then(ready);
    const images=Array.from(root.current.querySelectorAll("img"));
    images.forEach(image=>image.addEventListener("load",ready));
    return()=>{disposed=true;images.forEach(image=>image.removeEventListener("load",ready));};
  },{scope:root,dependencies:[preferences.motion,preferences.capable],revertOnUpdate:true});
  return <main ref={root} id="main" tabIndex={-1} className="homepage-motion"><div ref={progress} className="reading-progress" aria-hidden="true"/>{children}</main>;
}
