"use client";
import { useId, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTiming } from "@/lib/motion";
import { Icon } from "@/components/site/Icons";
gsap.registerPlugin(useGSAP);
function Device({x, y, label}: {x: number; y: number; label: string}) {
  return <g transform={"translate(" + x + " " + y + ")"}>
    <rect className="device-card" x="-58" y="-52" width="116" height="116" rx="18"/>
    <rect className="device-screen" x="-20" y="-31" width="40" height="27" rx="4"/>
    <path className="device-stand" d="M0-4v7M-10 3h20"/>
    <text className="device-label" textAnchor="middle" y="26">{label}</text>
    <circle cx="-20" cy="44" r="2.7" fill="var(--success)"/><text className="device-presence" x="-12" y="48">Nearby</text>
  </g>;
}
export function LanScene() {
  const root = useRef<HTMLElement>(null);
  const route = useRef<SVGPathElement>(null);
  const packet = useRef<SVGCircleElement>(null);
  const receipt = useRef<SVGCircleElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const sequence = useRef<gsap.core.Timeline | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const path = route.current;
      if (!path || !packet.current || !receipt.current) return;
      const length = path.getTotalLength();
      const outgoing = {progress: 0};
      const returning = {progress: 1};
      const position = (node: SVGCircleElement, progress: number) => {
        const point = path.getPointAtLength(progress * length);
        node.setAttribute("cx", String(point.x)); node.setAttribute("cy", String(point.y));
      };
      const forward = packet.current;
      const backward = receipt.current;
      position(forward, 0); position(backward, 1);
      const timeline = gsap.timeline({delay: .45});
      timeline.set([forward, backward], {opacity: 0})
        .to(forward, {opacity: 1, duration: .15}, 0)
        .fromTo(outgoing, {progress: 0}, {progress: 1, duration: motionTiming.signal, ease: "power1.inOut", onUpdate: () => position(forward, outgoing.progress)}, 0)
        .to(forward, {opacity: 0, duration: .2}, 1.3)
        .to(backward, {opacity: 1, duration: .15}, motionTiming.receiptStart)
        .fromTo(returning, {progress: 1}, {progress: 0, duration: motionTiming.receipt, ease: "power1.inOut", onUpdate: () => position(backward, returning.progress)}, motionTiming.receiptStart)
        .to(backward, {opacity: 0, duration: .2}, 3);
      sequence.current = timeline;
      if (replay.current) replay.current.disabled = false;
      return () => {
        sequence.current = null;
        if (replay.current) replay.current.disabled = true;
      };
    });
    return () => media.revert();
  }, {scope: root});
  return <figure ref={root} className="lan-scene">
    <div className="scene-heading"><p className="eyebrow">Your local network</p><h2>A direct connection.</h2></div>
    <div className="scene-map"><svg viewBox="0 0 600 360" role="img" aria-labelledby={titleId + " " + descriptionId}>
      <title id={titleId}>Three PCs connected on a local network</title><desc id={descriptionId}>An illustration of direct PC-to-PC messaging. Your PC connects to Design PC and Team PC, without a central messaging server. The moving signal is illustrative, not a speed measurement.</desc>
      <path className="peer-link" d="M130 144Q170 260 300 288M470 144Q430 260 300 288"/>
      <path ref={route} className="peer-link peer-direct" d="M130 144C190 40 410 40 470 144"/>
      <circle ref={packet} className="packet" cx="130" cy="144" r="6" aria-hidden="true"/>
      <circle ref={receipt} className="receipt" cx="470" cy="144" r="5" aria-hidden="true"/>
      <Device x={130} y={144} label="Your PC"/><Device x={470} y={144} label="Design PC"/><Device x={300} y={278} label="Team PC"/>
    </svg></div>
    <figcaption className="scene-footer"><span>Illustration · no central messaging server</span><button ref={replay} className="replay-button enhanced-control" type="button" disabled aria-label="Replay the illustrated LAN signal; unavailable with reduced motion" onClick={() => sequence.current?.restart()}><Icon name="replay"/>Replay</button></figcaption>
  </figure>;
}
