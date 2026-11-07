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
// Every route terminates at a computer bezel, never in the empty background.
const routes = nodes.flatMap(([x,y],a)=>nodes.slice(a+1).map(([tx,ty],index)=>{
  const b=a+index+1, dx=tx-x, dy=ty-y;
  const horizontal=Math.abs(dx)>Math.abs(dy)*1.4;
  const sx=x+(horizontal?Math.sign(dx)*30:0), sy=y+(horizontal?0:Math.sign(dy)*20);
  const ex=tx-(horizontal?Math.sign(dx)*30:0), ey=ty-(horizontal?0:Math.sign(dy)*20);
  const bend=45*(a%2?1:-1);
  return {a,b,ring:b===a+1||(a===0&&b===nodes.length-1),d:"M"+sx+" "+sy+"C"+(sx+dx*.33)+" "+(sy+dy*.33+bend)+" "+(ex-dx*.33)+" "+(ey-dy*.33+bend)+" "+ex+" "+ey};
}));
export function NetworkWallpaper(){
  const root=useRef<HTMLDivElement>(null), depth=useRef<HTMLDivElement>(null), pointer=useRef<HTMLDivElement>(null);
  const paths=useRef<(SVGPathElement|null)[]>([]), trails=useRef<(SVGPathElement|null)[]>([]), halos=useRef<(SVGPathElement|null)[]>([]);
  const computers=useRef<(SVGGElement|null)[]>([]), signal=useRef<SVGCircleElement>(null), glow=useRef<SVGCircleElement>(null);
  const clock=useRef<gsap.core.Tween|null>(null), scroll=useRef<gsap.core.Tween|null>(null);
  const [paused,setPaused]=useState(false);
  const preferences=useScenePreferences(), pathname=usePathname();
  useGSAP(()=>{
    if(!preferences.capable)return;
    const progress={value:0}, lengths=paths.current.map(path=>path?.getTotalLength()??0);
    let previous=0, selected=-1, reverse=false;
    const choose=()=>{
      if(selected>=0){for(const element of [paths.current[selected],trails.current[selected],halos.current[selected]]){if(element)element.style.opacity="0";}}
      const next=Math.floor(Math.random()*(routes.length-1));selected=next>=selected?next+1:next;
      if(selected>=routes.length)selected=0;
      reverse=Math.random()<.5;
      root.current?.setAttribute("data-source",String(reverse?routes[selected].b:routes[selected].a));
      root.current?.setAttribute("data-target",String(reverse?routes[selected].a:routes[selected].b));
    };
    paths.current.forEach(path=>{if(path)path.style.opacity="0";});choose();
    clock.current=gsap.to(progress,{value:1,duration:4.8,ease:"none",repeat:-1,paused:true,onRepeat:choose,onUpdate:()=>{
      const path=paths.current[selected];
      if(!root.current||!path)return;
      const now=performance.now();if(now-previous<1000/30)return;previous=now;
      const p=progress.value, travel=Math.max(0,Math.min(1,(p-.12)/.6)), t=reverse?1-travel:travel;
      const pulse=Math.sin(Math.PI*Math.max(0,Math.min(1,(p-.72)/.26)));
      const route=routes[selected], point=path.getPointAtLength(lengths[selected]*t);
      const visible=p>=.12&&p<.72, target=reverse?route.a:route.b;
      path.style.opacity=String(.36+Math.sin(Math.PI*travel)*.25);
      for(const streak of [trails.current[selected],halos.current[selected]]){streak?.setAttribute("stroke-dashoffset",String((reverse?0:65)-1000*t));if(streak)streak.style.opacity=visible?"1":"0";}
      for(const head of [signal.current,glow.current]){head?.setAttribute("cx",String(point.x));head?.setAttribute("cy",String(point.y));if(head)head.style.opacity=visible?"1":"0";}
      computers.current.forEach((computer,index)=>computer?.style.setProperty("--arrival",String(index===target?pulse:0)));
      root.current?.setAttribute("data-phase",visible?"travel":pulse>0?"arrival":"idle");
    }});
    scroll.current=gsap.fromTo(depth.current,{"--network-light":.35},{y:-45,"--network-light":.75,ease:"none",scrollTrigger:{trigger:document.documentElement,start:0,end:"max",scrub:1,invalidateOnRefresh:true}});
    const x=gsap.quickTo(pointer.current,"x",{duration:1.2,ease:"power2.out"}), y=gsap.quickTo(pointer.current,"y",{duration:1.2,ease:"power2.out"});
    const move=(event:PointerEvent)=>{if(event.pointerType!=="mouse"||document.hidden||root.current?.dataset.paused==="true")return;x((event.clientX/innerWidth-.5)*12);y((event.clientY/innerHeight-.5)*8);};
    window.addEventListener("pointermove",move,{passive:true});
    return()=>{paths.current.forEach(path=>path?.style.removeProperty("opacity"));computers.current.forEach(computer=>computer?.style.removeProperty("--arrival"));window.removeEventListener("pointermove",move);clock.current=null;scroll.current=null;};
  },{scope:root,dependencies:[preferences.capable,pathname],revertOnUpdate:true});
  useEffect(()=>{
    const active=preferences.capable&&preferences.visible&&!paused;
    clock.current?.paused(!active);
    if(active)scroll.current?.scrollTrigger?.enable();else scroll.current?.scrollTrigger?.disable(false);
  },[preferences.capable,preferences.visible,paused,pathname]);
  return <>
    <div ref={root} className="network-wallpaper" data-animated={preferences.capable} data-paused={paused} aria-hidden="true"><div ref={depth} className="wallpaper-scroll-plane"><div ref={pointer} className="wallpaper-pointer-plane"><svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" fill="none">
      <g className="ambient-routes">{routes.map((route,index)=><path key={route.d} ref={element=>{paths.current[index]=element;}} d={route.d} data-static={route.ring}/>)}</g>
      <g className="ambient-streak-glows">{routes.map((route,index)=><path key={route.d} ref={element=>{halos.current[index]=element;}} d={route.d} pathLength="1000" strokeDasharray="65 935"/>)}</g>
      <g className="ambient-streaks">{routes.map((route,index)=><path key={route.d} ref={element=>{trails.current[index]=element;}} d={route.d} pathLength="1000" strokeDasharray="65 935"/>)}</g>
      <g className="ambient-computers">{nodes.map(([x,y],index)=><g key={index} ref={element=>{computers.current[index]=element;}} transform={"translate("+x+" "+y+")"}><rect className="ambient-arrival-glow" x="-36" y="-29" width="72" height="50" rx="10"/><rect className="ambient-case" x="-30" y="-23" width="60" height="38" rx="5"/><path d="M-8 25H8M0 15V25"/><circle className="ambient-node" r="3.2"/></g>)}</g>
      <g className="ambient-head-glows"><circle ref={glow} r="9"/></g><g className="ambient-signals"><circle ref={signal} r="3.5"/></g>
    </svg></div></div><div className="wallpaper-scrim"/></div>
    {preferences.capable&&<button type="button" className="ambience-control glass-panel" aria-pressed={paused} onClick={()=>setPaused(value=>!value)} aria-label={paused?"Resume network background animation":"Pause network background animation"}><Icon name={paused?"play":"pause"}/><span>{paused?"Resume ambience":"Pause ambience"}</span></button>}
  </>;
}
