"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";
import { Icon } from "@/components/site/Icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const nodes = [[150,160],[700,90],[1340,210],[1120,690],[480,760],[220,490]];
const paths = ["M150 160C340 60 490 50 700 90","M700 90C920 40 1180 100 1340 210","M1340 210C1510 400 1390 620 1120 690","M1120 690C930 860 670 870 480 760","M480 760C300 730 160 650 220 490","M220 490C80 380 70 230 150 160","M220 490C620 210 950 340 1120 690"];

export function NetworkWallpaper(){
  const root = useRef<HTMLDivElement>(null), depth = useRef<HTMLDivElement>(null), pointer = useRef<HTMLDivElement>(null);
  const routeRefs = useRef<(SVGPathElement|null)[]>([]), signals = useRef<(SVGCircleElement|null)[]>([]), lights = useRef<(SVGCircleElement|null)[]>([]);
  const trails = useRef<(SVGPathElement|null)[]>([]), halos = useRef<(SVGPathElement|null)[]>([]), glows = useRef<(SVGCircleElement|null)[]>([]);
  const clock = useRef<gsap.core.Tween|null>(null), scroll = useRef<gsap.core.Tween|null>(null);
  const [paused,setPaused] = useState(false);
  const preferences = useScenePreferences(), pathname = usePathname();
  useGSAP(()=>{
    if(!preferences.capable)return;
    const progress = {value:0};
    const lengths = routeRefs.current.map(route=>route?.getTotalLength()??0);
    let previous = 0;
    clock.current = gsap.to(progress,{value:1,duration:10,ease:"none",repeat:-1,paused:true,onUpdate:()=>{
      const now=performance.now();if(now-previous<1000/30)return;previous=now;
      routeRefs.current.forEach((route,index)=>{
        const signal=signals.current[index];if(!route||!signal)return;
        const phase=(progress.value+index*.139)%1, reverse=index%2===1, t=reverse?1-phase:phase;
        const point=route.getPointAtLength(lengths[index]*t), fade=Math.min(1,phase/.05,(1-phase)/.05);
        const offset=String((reverse?0:85)-1000*t);
        for(const streak of [trails.current[index],halos.current[index]]){streak?.setAttribute("stroke-dashoffset",offset);streak?.setAttribute("opacity",String(fade));}
        signal.setAttribute("cx",String(point.x));signal.setAttribute("cy",String(point.y));signal.setAttribute("opacity",String(fade));
        const glow=glows.current[index];glow?.setAttribute("cx",String(point.x));glow?.setAttribute("cy",String(point.y));glow?.setAttribute("opacity",String(fade));
      });
      lights.current.forEach((light,index)=>light?.setAttribute("r",String(3.2+Math.max(0,Math.sin(progress.value*Math.PI*4+index)) * 2)));
    }});
    scroll.current=gsap.fromTo(depth.current,{"--network-light":.35},{y:-65,rotation:-1.5,"--network-light":.9,ease:"none",scrollTrigger:{trigger:document.documentElement,start:0,end:"max",scrub:1,invalidateOnRefresh:true}});
    const x=gsap.quickTo(pointer.current,"x",{duration:1.2,ease:"power2.out"}),y=gsap.quickTo(pointer.current,"y",{duration:1.2,ease:"power2.out"});
    const move=(event:PointerEvent)=>{if(event.pointerType!=="mouse"||document.hidden||root.current?.dataset.paused==="true")return;x((event.clientX/innerWidth-.5)*18);y((event.clientY/innerHeight-.5)*12);};
    window.addEventListener("pointermove",move,{passive:true});
    const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("pointermove",move);clock.current=null;scroll.current=null;};
  },{scope:root,dependencies:[preferences.capable,pathname],revertOnUpdate:true});
  useEffect(()=>{
    const active=preferences.capable&&preferences.visible&&!paused;
    clock.current?.paused(!active);
    if(active)scroll.current?.scrollTrigger?.enable();else scroll.current?.scrollTrigger?.disable(false);
  },[preferences.capable,preferences.visible,paused,pathname]);
  return <>
    <div ref={root} className="network-wallpaper" data-animated={preferences.capable} data-paused={paused} aria-hidden="true"><div ref={depth} className="wallpaper-scroll-plane"><div ref={pointer} className="wallpaper-pointer-plane"><svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" fill="none"><g className="ambient-routes">{paths.map((path,index)=><path key={path} ref={element=>{routeRefs.current[index]=element;}} d={path}/>)}</g><g className="ambient-streak-glows">{paths.map((path,index)=><path key={path} ref={element=>{halos.current[index]=element;}} d={path} pathLength="1000" strokeDasharray="85 915"/>)}</g><g className="ambient-streaks">{paths.map((path,index)=><path key={path} ref={element=>{trails.current[index]=element;}} d={path} pathLength="1000" strokeDasharray="85 915"/>)}</g><g className="ambient-computers">{nodes.map(([x,y],index)=><g key={index} transform={"translate("+x+" "+y+")"}><rect x="-30" y="-23" width="60" height="38" rx="5"/><path d="M-8 25H8M0 15V25"/><circle ref={element=>{lights.current[index]=element;}} className="ambient-node" r="3.2"/></g>)}</g><g className="ambient-head-glows">{paths.map((path,index)=><circle key={path} ref={element=>{glows.current[index]=element;}} r="9"/>)}</g><g className="ambient-signals">{paths.map((path,index)=><circle key={path} ref={element=>{signals.current[index]=element;}} r="3.5"/>)}</g></svg></div></div><div className="wallpaper-scrim"/></div>
    {preferences.capable&&<button type="button" className="ambience-control glass-panel" aria-pressed={paused} onClick={()=>setPaused(value=>!value)} aria-label={paused?"Resume network background animation":"Pause network background animation"}><Icon name={paused?"play":"pause"}/><span>{paused?"Resume ambience":"Pause ambience"}</span></button>}
  </>;
}
