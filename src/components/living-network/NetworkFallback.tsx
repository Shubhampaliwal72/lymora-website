"use client";
import { useEffect, useRef, type MutableRefObject } from "react";
import { connections, illustratedDevices, routeBetween, arrivalPulse, pointOnRoute, storyAt, svgRoute, type Endpoint, type SceneClock, type Transfer } from "./scene";

export function NetworkFallback({clock,invalidateRef,endpoint,source,transfer}:{clock:MutableRefObject<SceneClock>;invalidateRef:MutableRefObject<(()=>void)|null>;endpoint:Endpoint;source:Endpoint;transfer:Transfer}) {
  const root=useRef<SVGSVGElement>(null),packet=useRef<SVGGElement>(null),receipt=useRef<SVGCircleElement>(null);
  useEffect(()=>{
    const draw=()=>{
      const story=storyAt(clock.current.progress),points=routeBetween(source,endpoint,true);
      root.current?.querySelectorAll<SVGElement>("[data-device]").forEach(device=>device.style.setProperty("--arrival",String(device.dataset.device===endpoint?arrivalPulse(clock.current.progress):0)));
      const forward=pointOnRoute(points,story.travel),reverse=pointOnRoute(points,1-story.receipt);
      packet.current?.setAttribute("transform","translate("+forward[0]+" "+forward[1]+")");packet.current?.setAttribute("opacity",story.packet?"1":"0");
      receipt.current?.setAttribute("cx",String(reverse[0]));receipt.current?.setAttribute("cy",String(reverse[1]));receipt.current?.setAttribute("opacity",story.returning?"1":"0");
    };
    invalidateRef.current=draw;draw();return()=>{invalidateRef.current=null;};
  },[clock,endpoint,source,invalidateRef]);
  return <svg ref={root} className="network-fallback topology-illustration" viewBox="0 0 1000 780" fill="none" aria-hidden="true">
    {connections.map(([a,b])=><path key={a+b} className="topology-wire" data-active={(a===source&&b===endpoint)||(b===source&&a===endpoint)} d={svgRoute(routeBetween(a,b,true))}/>)}
    {illustratedDevices.map(device=>{
      const x=device.x-device.width/2,y=device.y-device.height/2,w=device.width,h=device.height;
      return <g key={device.id} data-device={device.id}>
        <rect className="topology-stand" x={device.x-w*.03} y={y+h} width={w*.06} height={h*.21} rx="3"/>
        <rect className="topology-stand" x={device.x-w*.19} y={y+h*1.19} width={w*.38} height={h*.035} rx="4"/>
        <rect className="topology-bezel" x={x} y={y} width={w} height={h} rx="10"/>
        <rect className="topology-screen" x={x+6} y={y+6} width={w-12} height={h-12} rx="6"/>
        {device.app?<><image className="theme-image-dark" href="/media/product/chats-dark.png" x={x+8} y={y+8} width={w-16} height={h-16} preserveAspectRatio="xMidYMid meet"/><image className="theme-image-light" href="/media/product/chats-light.png" x={x+8} y={y+8} width={w-16} height={h-16} preserveAspectRatio="xMidYMid meet"/></>:<><image className="theme-image-dark" href="/brand/mark-dark.png" x={device.x-w*.18} y={device.y-w*.18} width={w*.36} height={w*.36}/><image className="theme-image-light" href="/brand/mark-light.png" x={device.x-w*.18} y={device.y-w*.18} width={w*.36} height={w*.36}/></>}
        <rect className="topology-arrival" x={x+.5} y={y+.5} width={w-1} height={h-1} rx="10"/>
        <circle className="topology-led" cx={x+w-12} cy={y+h-8} r="2"/>
      </g>;
    })}
    <g ref={packet} className="fallback-packet" opacity="0">{transfer==="message"?<><rect x="-11" y="-8" width="22" height="16" rx="4"/><path d="m-8-5 8 6 8-6"/></>:<><path d="M-8-11H2L9-4V11H-8Z"/><path d="M2-11V-4H9M-3 2H4M-3 6H4"/></>}</g>
    <circle ref={receipt} className="fallback-receipt" r="3" opacity="0"/>
  </svg>;
}
