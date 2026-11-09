"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import { Icon } from "@/components/site/Icons";
import { NetworkFallback } from "./NetworkFallback";
import { useScenePreferences } from "./useScenePreferences";
import { endpoints, illustratedDevices, INTRO_DURATION, nextPair, storyAt, type Endpoint, type SceneClock, type ScenePointer, type Transfer } from "./scene";

gsap.registerPlugin(useGSAP);
const NetworkCanvas = dynamic(() => import("./NetworkCanvas"), {ssr: false});
class SceneBoundary extends Component<{children: ReactNode; onUnavailable: () => void}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export function LivingNetwork() {
  const root = useRef<HTMLElement>(null);
  const clock = useRef<SceneClock>({progress: 0});
  const pointer = useRef<ScenePointer>({x: 0, y: 0});
  const invalidate = useRef<(() => void) | null>(null);
  const fallbackDraw = useRef<(() => void) | null>(null);
  const timeline = useRef<gsap.core.Tween | null>(null);
  const phaseRef = useRef(0);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [intersecting, setIntersecting] = useState(true);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState<"dark" | "light" | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [[source, endpoint], setPair] = useState<[Endpoint, Endpoint]>(["you", "studio"]);
  const [transfer, setTransfer] = useState<Transfer>("message");
  const [phase, setPhase] = useState(0);
  const preferences = useScenePreferences();
  const reduce = !preferences.motion;
  const onReady = useCallback(() => setReady(preferences.theme), [preferences.theme]);
  const onUnavailable = useCallback(() => { setUnavailable(true); setReady(null); }, []);
  const canvas = preferences.motion && preferences.capable && load && !unavailable;
  const active = playing && preferences.visible && intersecting && preferences.motion;
  const destination = endpoints.find(peer => peer.id === endpoint)!.name;
  const select = useCallback((peer: Endpoint) => {setPair([peer === "you" ? "studio" : "you", peer]); setPlaying(true); setRun(value => value + 1);}, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
      if (entry.isIntersecting) setLoad(true);
    }, {threshold: .05});
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useGSAP(() => {
    // Update React only at semantic boundaries; the per-frame path stays outside React.
    const draw = () => {const next = storyAt(clock.current.progress).phase; if(next !== phaseRef.current) {phaseRef.current = next; setPhase(next);} fallbackDraw.current?.(); invalidate.current?.();};
    if (!preferences.motion) { clock.current.progress = 1; draw(); return; }
    clock.current.progress = 0; draw();
    timeline.current = gsap.to(clock.current, {progress: 1, duration: INTRO_DURATION, ease: "none", paused: true, onUpdate: draw, onComplete: () => {setPair(nextPair([source,endpoint]));setRun(value=>value+1); }});
    return () => { timeline.current = null; };
  }, {scope: root, dependencies: [run, source, endpoint, preferences.motion, preferences.capable], revertOnUpdate: true});
  useEffect(() => { timeline.current?.paused(!active); }, [active, run, preferences.capable]);
  const replay = () => { setPlaying(true); setRun(value => value + 1); };
  const move = (event: React.PointerEvent<HTMLElement>) => {
    if (!canvas || event.pointerType !== "mouse" || !preferences.motion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    pointer.current.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    invalidate.current?.();
  };
  const status = ["Finding nearby computers", "Connecting directly to " + destination, (transfer === "file" ? "File" : "Message") + " on its way to " + destination, (transfer === "file" ? "File" : "Message") + " arrives at " + destination, (transfer === "file" ? "File" : "Message") + " received by " + destination][phase];
  return <figure ref={root} className="living-network" data-mode={canvas && ready === preferences.theme ? "3d" : "illustrated"} data-endpoint={endpoint} data-source={source} data-automatic="true" data-topology="peer-mesh" data-transfer={transfer} data-phase={phase} onPointerMove={move} onPointerLeave={() => {pointer.current.x = 0; pointer.current.y = 0; invalidate.current?.();}} aria-labelledby="network-caption">
    <div className="network-world">
      <NetworkFallback clock={clock} invalidateRef={fallbackDraw} source={source} endpoint={endpoint} transfer={transfer} />
      {canvas && <SceneBoundary onUnavailable={onUnavailable}><NetworkCanvas theme={preferences.theme} clock={clock} pointer={pointer} invalidateRef={invalidate} source={source} endpoint={endpoint} transfer={transfer} onSelect={select} onReady={onReady} onUnavailable={onUnavailable} /></SceneBoundary>}
      {illustratedDevices.map(peer=><button key={peer.id} type="button" className="network-device-label" style={{left:peer.label[0]/10+"%",top:"clamp(22px, "+peer.label[1]/7.8+"%, calc(100% - 22px))"}} aria-label={"Send preview to "+endpoints.find(item=>item.id===peer.id)!.name} aria-pressed={endpoint===peer.id} onClick={()=>select(peer.id)}>{endpoints.find(item=>item.id===peer.id)!.name}<span aria-hidden="true"/></button>)}
    </div>
    <div className="network-demo-strip">
      <div className="network-demo-status"><span className="demo-kicker"><span className="signal-dot"/>Live LAN preview</span><p aria-live="off"><span>{endpoints.find(peer=>peer.id===source)!.name}</span><span className="demo-direction" aria-hidden="true">&rarr;</span><span>{destination}</span><small>{["Discovering", "Connecting", "Sending", "Arriving", "Delivered"][phase]}</small></p><span className="sr-only">{status}</span></div>
      <div className="network-demo-actions"><div className="demo-transfer" role="group" aria-label="Preview content">{(["message","file"] as const).map(kind=><motion.button key={kind} type="button" aria-label={kind==="message"?"Send a message in the preview":"Send a file in the preview"} aria-pressed={transfer===kind} onClick={()=>{setTransfer(kind);replay();}} whileTap={reduce?undefined:{scale:.97}}><Icon name={kind}/><span>{kind==="message"?"Message":"File"}</span></motion.button>)}</div>{preferences.motion && <button className="demo-pause" type="button" aria-label={playing?"Pause network preview":"Play network preview"} onClick={()=>setPlaying(value=>!value)}><Icon name={playing?"pause":"play"}/></button>}</div>
    </div>
    <figcaption className="network-caption" id="network-caption"><span>Illustrated LAN &middot; actual app, fictional demo data</span><span>Choose a PC to follow the connection.</span></figcaption>
  </figure>;
}
