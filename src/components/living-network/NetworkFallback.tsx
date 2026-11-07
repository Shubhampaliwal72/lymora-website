"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { endpoints, fallbackRoutes, pointOnRoute, storyAt, svgRoute, type Endpoint, type SceneClock, type Transfer } from "./scene";

export function NetworkFallback({ clock, invalidateRef, endpoint, transfer }: {clock: MutableRefObject<SceneClock>; invalidateRef: MutableRefObject<(() => void) | null>; endpoint: Endpoint; transfer: Transfer}) {
  const packet = useRef<SVGGElement>(null), receipt = useRef<SVGCircleElement>(null), route = useRef<SVGPathElement>(null);
  useEffect(() => {
    const draw = () => {
      const story = storyAt(clock.current.progress);
      const forward = pointOnRoute(fallbackRoutes[endpoint], story.travel);
      const reverse = pointOnRoute(fallbackRoutes[endpoint], 1 - story.receipt);
      packet.current?.setAttribute("transform", "translate(" + forward[0] + " " + forward[1] + ")");
      packet.current?.setAttribute("opacity", story.packet ? "1" : "0");
      receipt.current?.setAttribute("cx", String(reverse[0]));
      receipt.current?.setAttribute("cy", String(reverse[1]));
      receipt.current?.setAttribute("opacity", story.returning ? "1" : "0");
      route.current?.setAttribute("stroke-dashoffset", String(1 - story.connect));
    };
    invalidateRef.current = draw; draw();
    return () => { invalidateRef.current = null; };
  }, [clock, endpoint, invalidateRef]);
  return <div className="network-fallback" aria-hidden="true">
    <svg className="fallback-paths" viewBox="0 0 1000 780" fill="none">
      {endpoints.map(peer => <path key={peer.id} className="fallback-path-muted" d={svgRoute(fallbackRoutes[peer.id])} />)}
      <path ref={route} className="fallback-path" d={svgRoute(fallbackRoutes[endpoint])} pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
      <g ref={packet} className="fallback-packet" opacity="0">{transfer === "message" ? <><rect x="-14" y="-10" width="28" height="20" rx="5"/><path d="m-10-6 10 8 10-8"/></> : <><path d="M-9-14H3L11-6V14H-9Z"/><path d="M3-14V-6H11M-4 2H6M-4 7H6"/></>}</g>
      <circle ref={receipt} className="fallback-receipt" r="4" opacity="0" />
    </svg>
    <div className="fallback-computer fallback-back" data-selected={endpoint === "studio"}><div className="fallback-screen"><div className="screen-mark"/></div><span className="computer-label">Studio PC</span></div>
    <div className="fallback-computer fallback-right" data-selected={endpoint === "team"}><div className="fallback-screen"><div className="screen-mark"/></div><span className="computer-label">Team PC</span></div>
    <div className="fallback-computer fallback-front"><div className="fallback-screen"><div className="screen-app"/></div><span className="computer-label">Your PC</span></div>
  </div>;
}
