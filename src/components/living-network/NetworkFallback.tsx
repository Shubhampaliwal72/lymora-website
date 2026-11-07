"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { connections, routeBetween, arrivalPulse, pointOnRoute, storyAt, svgRoute, type Endpoint, type SceneClock, type Transfer } from "./scene";

export function NetworkFallback({ clock, invalidateRef, endpoint, source, transfer }: {clock: MutableRefObject<SceneClock>; invalidateRef: MutableRefObject<(() => void) | null>; endpoint: Endpoint; source: Endpoint; transfer: Transfer}) {
  const root = useRef<HTMLDivElement>(null);
  const packet = useRef<SVGGElement>(null), receipt = useRef<SVGCircleElement>(null), route = useRef<SVGPathElement>(null);
  useEffect(() => {
    const draw = () => {
      const story = storyAt(clock.current.progress);
      root.current?.querySelectorAll<HTMLElement>("[data-device]").forEach(device=>device.style.setProperty("--arrival",String(device.dataset.device===endpoint?arrivalPulse(clock.current.progress):0)));
      const forward = pointOnRoute(routeBetween(source,endpoint,true), story.travel);
      const reverse = pointOnRoute(routeBetween(source,endpoint,true), 1 - story.receipt);
      packet.current?.setAttribute("transform", "translate(" + forward[0] + " " + forward[1] + ")");
      packet.current?.setAttribute("opacity", story.packet ? "1" : "0");
      receipt.current?.setAttribute("cx", String(reverse[0]));
      receipt.current?.setAttribute("cy", String(reverse[1]));
      receipt.current?.setAttribute("opacity", story.returning ? "1" : "0");
      route.current?.setAttribute("stroke-dashoffset", String(1 - story.connect));
    };
    invalidateRef.current = draw; draw();
    return () => { invalidateRef.current = null; };
  }, [clock, endpoint, source, invalidateRef]);
  return <div ref={root} className="network-fallback" aria-hidden="true">
    <svg className="fallback-paths" viewBox="0 0 1000 780" fill="none">
      {connections.map(([a,b]) => <path key={a+b} className="fallback-path-muted" d={svgRoute(routeBetween(a,b,true))} />)}
      <path ref={route} className="fallback-path" d={svgRoute(routeBetween(source,endpoint,true))} pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
      <g ref={packet} className="fallback-packet" opacity="0">{transfer === "message" ? <><rect x="-14" y="-10" width="28" height="20" rx="5"/><path d="m-10-6 10 8 10-8"/></> : <><path d="M-9-14H3L11-6V14H-9Z"/><path d="M3-14V-6H11M-4 2H6M-4 7H6"/></>}</g>
      <circle ref={receipt} className="fallback-receipt" r="4" opacity="0" />
    </svg>
    <div className="fallback-computer fallback-back" data-device="studio" data-selected={endpoint === "studio"}><div className="fallback-screen"><div className="screen-mark"/></div><span className="computer-label">Studio PC</span></div>
    <div className="fallback-computer fallback-right" data-device="team" data-selected={endpoint === "team"}><div className="fallback-screen"><div className="screen-mark"/></div><span className="computer-label">Team PC</span></div>
    <div className="fallback-computer fallback-front" data-device="you"><div className="fallback-screen"><div className="screen-app"/></div><span className="computer-label">Your PC</span></div>
  </div>;
}
