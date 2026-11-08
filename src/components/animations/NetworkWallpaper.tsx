"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";
import { Icon } from "@/components/site/Icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);
// Six peers form a perimeter ring; no lines cross the central reading area.
const nodes = [[105,220],[800,90],[1495,220],[1495,780],[800,910],[105,780]];
const routes = nodes.map(([x,y],a) => {
  const b=(a+1)%nodes.length, [tx,ty]=nodes[b], dx=tx-x, dy=ty-y;
  const vertical=Math.abs(dy)>Math.abs(dx);
  const sx=x+(vertical?0:Math.sign(dx)*42), sy=y+(vertical?(dy>0?25:-29):0);
  const ex=tx-(vertical?0:Math.sign(dx)*42), ey=ty+(vertical?(dy>0?-29:25):0);
  const bend=vertical?(x<800?-26:26):0;
  return {a,b,d:"M"+sx+" "+sy+"C"+(sx+dx*.33+bend)+" "+(sy+dy*.33)+" "+(ex-dx*.33+bend)+" "+(ey-dy*.33)+" "+ex+" "+ey};
});
export function NetworkWallpaper(){
  const root=useRef<HTMLDivElement>(null), depth=useRef<HTMLDivElement>(null), pointer=useRef<HTMLDivElement>(null);
  const paths=useRef<(SVGPathElement|null)[]>([]), trails=useRef<(SVGPathElement|null)[]>([]), halos=useRef<(SVGPathElement|null)[]>([]);
  const computers=useRef<(SVGGElement|null)[]>([]), signal=useRef<SVGCircleElement>(null), glow=useRef<SVGCircleElement>(null);
  const clock=useRef<gsap.core.Tween|null>(null), scroll=useRef<gsap.core.Tween|null>(null);
  const [paused,setPaused]=useState(false);
  const preferences=useScenePreferences(), pathname=usePathname();
  useGSAP(()=>{
    if(!preferences.motion)return;
    const progress={value:0}, lengths=paths.current.map(path=>path?.getTotalLength()??0);
    let selected=-1, reverse=false;
    const choose=()=>{
      if(selected>=0){for(const element of [paths.current[selected],trails.current[selected],halos.current[selected]]){if(element)element.style.removeProperty("opacity");}}
      const next=Math.floor(Math.random()*(routes.length-1));selected=next>=selected?next+1:next;
      if(selected>=routes.length)selected=0;
      reverse=Math.random()<.5;
      root.current?.setAttribute("data-source",String(reverse?routes[selected].b:routes[selected].a));
      root.current?.setAttribute("data-target",String(reverse?routes[selected].a:routes[selected].b));
    };
    choose();
    clock.current=gsap.to(progress,{value:1,duration:6.4,ease:"none",repeat:-1,paused:true,onRepeat:choose,onUpdate:()=>{
      const path=paths.current[selected];
      if(!root.current||!path)return;
      const p=progress.value, travel=Math.max(0,Math.min(1,(p-.08)/.7)), t=reverse?1-travel:travel;
      const pulse=Math.sin(Math.PI*Math.max(0,Math.min(1,(p-.78)/.2)))**2;
      const route=routes[selected], point=path.getPointAtLength(lengths[selected]*t);
      const visible=p>=.08&&p<.78, target=reverse?route.a:route.b;
      path.style.opacity=String(.24+Math.sin(Math.PI*travel)*.22);
      for(const streak of [trails.current[selected],halos.current[selected]]){streak?.setAttribute("stroke-dashoffset",String((reverse?0:42)-1000*t));if(streak)streak.style.opacity=visible?"1":"0";}
      for(const head of [signal.current,glow.current]){head?.setAttribute("cx",String(point.x));head?.setAttribute("cy",String(point.y));if(head)head.style.opacity=visible?String(Math.min(1,travel*12,(1-travel)*12)):"0";}
      computers.current.forEach((computer,index)=>computer?.style.setProperty("--arrival",String(index===target?pulse:0)));
      root.current?.setAttribute("data-phase",visible?"travel":pulse>0?"arrival":"idle");
    }});
    scroll.current=gsap.fromTo(depth.current,{"--network-light":.35},{y:-45,"--network-light":.75,ease:"none",scrollTrigger:{trigger:document.documentElement,start:0,end:"max",scrub:1,invalidateOnRefresh:true}});
    const x=gsap.quickTo(pointer.current,"x",{duration:1.2,ease:"power2.out"}), y=gsap.quickTo(pointer.current,"y",{duration:1.2,ease:"power2.out"});
    const move=(event:PointerEvent)=>{if(!preferences.capable||event.pointerType!=="mouse"||document.hidden||root.current?.dataset.paused==="true")return;x((event.clientX/innerWidth-.5)*12);y((event.clientY/innerHeight-.5)*8);};
    window.addEventListener("pointermove",move,{passive:true});
    return()=>{paths.current.forEach(path=>path?.style.removeProperty("opacity"));computers.current.forEach(computer=>computer?.style.removeProperty("--arrival"));window.removeEventListener("pointermove",move);clock.current=null;scroll.current=null;};
  },{scope:root,dependencies:[preferences.capable,preferences.motion,pathname],revertOnUpdate:true});
  useEffect(()=>{
    const active=preferences.motion&&preferences.visible&&!paused;
    clock.current?.paused(!active);
    if(active)scroll.current?.scrollTrigger?.enable();else scroll.current?.scrollTrigger?.disable(false);
  },[preferences.capable,preferences.motion,preferences.visible,paused,pathname]);
  return <>
    <div ref={root} className="network-wallpaper" data-topology="perimeter-ring" data-animated={preferences.motion} data-paused={paused} aria-hidden="true"><div ref={depth} className="wallpaper-scroll-plane"><div ref={pointer} className="wallpaper-pointer-plane"><svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" fill="none">
      <g className="ambient-routes">{routes.map((route,index)=><path key={route.d} ref={element=>{paths.current[index]=element;}} d={route.d} data-static="true"/>)}</g>
      <g className="ambient-streak-glows">{routes.map((route,index)=><path key={route.d} ref={element=>{halos.current[index]=element;}} d={route.d} pathLength="1000" strokeDasharray="42 1000"/>)}</g>
      <g className="ambient-streaks">{routes.map((route,index)=><path key={route.d} ref={element=>{trails.current[index]=element;}} d={route.d} pathLength="1000" strokeDasharray="42 1000"/>)}</g>
      <g className="ambient-computers">{nodes.map(([x,y],index)=><g key={index} ref={element=>{computers.current[index]=element;}} transform={"translate("+x+" "+y+")"}><rect className="ambient-arrival-glow" x="-48" y="-35" width="96" height="66" rx="10"/><rect className="ambient-case" x="-42" y="-29" width="84" height="54" rx="6"/><rect className="ambient-screen" x="-36" y="-23" width="72" height="42" rx="3"/><path d="M-13 40H13M0 25V40"/><circle className="ambient-node" r="3.2"/></g>)}</g>
      <g className="ambient-head-glows"><circle ref={glow} r="5.5"/></g><g className="ambient-signals"><circle ref={signal} r="2.2"/></g>
    </svg></div></div><div className="wallpaper-scrim"/></div>
    {preferences.motion&&<button type="button" className="ambience-control glass-panel" aria-pressed={paused} onClick={()=>setPaused(value=>!value)} aria-label={paused?"Resume network background animation":"Pause network background animation"}><Icon name={paused?"play":"pause"}/><span>{paused?"Resume ambience":"Pause ambience"}</span></button>}
  </>;
}
