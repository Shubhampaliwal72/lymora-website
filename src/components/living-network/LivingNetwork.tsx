"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/site/Icons";
import { NetworkFallback } from "./NetworkFallback";
import { useScenePreferences } from "./useScenePreferences";
import { endpoints, INTRO_DURATION, storyAt, type Endpoint, type SceneClock, type ScenePointer, type Transfer } from "./scene";

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
  const [lighter, setLighter] = useState(false);
  const [endpoint, setEndpoint] = useState<Endpoint>("studio");
  const [transfer, setTransfer] = useState<Transfer>("message");
  const [phase, setPhase] = useState(0);
  const preferences = useScenePreferences();
  const reduce = useReducedMotion();
  const onReady = useCallback(() => setReady(preferences.theme), [preferences.theme]);
  const onUnavailable = useCallback(() => { setUnavailable(true); setReady(null); }, []);
  const canvas = preferences.capable && load && !lighter && !unavailable;
  const active = playing && preferences.visible && intersecting && preferences.motion;
  const destination = endpoints.find(peer => peer.id === endpoint)!.name;
  const select = useCallback((peer: Endpoint) => {setEndpoint(peer); setPlaying(true); setRun(value => value + 1);}, []);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setLoad(true)); });
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), {threshold: .05});
    if (root.current) observer.observe(root.current);
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); observer.disconnect(); };
  }, []);
  useGSAP(() => {
    // Update React only at semantic boundaries; the per-frame path stays outside React.
    const draw = () => {const next = storyAt(clock.current.progress).phase; if(next !== phaseRef.current) {phaseRef.current = next; setPhase(next);} fallbackDraw.current?.(); invalidate.current?.();};
    if (!preferences.motion) { clock.current.progress = 1; draw(); return; }
    clock.current.progress = 0; draw();
    timeline.current = gsap.to(clock.current, {progress: 1, duration: INTRO_DURATION, ease: "none", paused: true, onUpdate: draw, onComplete: () => setPlaying(false)});
    return () => { timeline.current = null; };
  }, {scope: root, dependencies: [run, preferences.motion], revertOnUpdate: true});
  useEffect(() => { timeline.current?.paused(!active); }, [active, run]);
  const replay = () => { setPlaying(true); setRun(value => value + 1); };
  const move = (event: React.PointerEvent<HTMLElement>) => {
    if (!canvas || event.pointerType !== "mouse" || !preferences.motion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    pointer.current.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    invalidate.current?.();
  };
  const status = ["Finding nearby computers", "Connecting directly to " + destination, (transfer === "file" ? "File" : "Message") + " on its way to " + destination, (transfer === "file" ? "File" : "Message") + " arrives at " + destination, (transfer === "file" ? "File" : "Message") + " received by " + destination][phase];
  return <figure ref={root} className="living-network" data-mode={canvas && ready === preferences.theme ? "3d" : "illustrated"} data-endpoint={endpoint} data-transfer={transfer} data-phase={phase} onPointerMove={move} onPointerLeave={() => {pointer.current.x = 0; pointer.current.y = 0; invalidate.current?.();}} aria-labelledby="network-caption">
    <div className="network-world">
      <NetworkFallback clock={clock} invalidateRef={fallbackDraw} endpoint={endpoint} transfer={transfer} />
      {canvas && <SceneBoundary onUnavailable={onUnavailable}><NetworkCanvas theme={preferences.theme} clock={clock} pointer={pointer} invalidateRef={invalidate} endpoint={endpoint} transfer={transfer} onSelect={select} onReady={onReady} onUnavailable={onUnavailable} /></SceneBoundary>}
      <span className="network-device-label device-label-studio" data-selected={endpoint === "studio"} aria-hidden="true">Studio PC</span>
      <span className="network-device-label device-label-team" data-selected={endpoint === "team"} aria-hidden="true">Team PC</span>
      <span className="network-device-label device-label-you" aria-hidden="true">Your PC</span>
    </div>
    <div className="network-interaction enhanced-control">
      <div className="network-choices">
        <div className="endpoint-choices" role="group" aria-label="Receiving computer"><span>Send to</span>{endpoints.map(peer => <motion.button type="button" tabIndex={0} key={peer.id} aria-pressed={endpoint === peer.id} onClick={() => select(peer.id)} whileTap={reduce ? undefined : {scale: .97}}>{peer.name}</motion.button>)}</div>
        <div className="transfer-choices" role="group" aria-label="Preview content">{(["message", "file"] as const).map(kind => <motion.button type="button" tabIndex={0} key={kind} aria-label={kind === "message" ? "Send a message in the preview" : "Send a file in the preview"} aria-pressed={transfer === kind} onClick={() => {setTransfer(kind); replay();}} whileTap={reduce ? undefined : {scale: .97}}><Icon name={kind === "message" ? "message" : "file"}/><span>{kind === "message" ? "Message" : "File"}</span></motion.button>)}</div>
      </div>
      <div className="network-story-status"><div className="story-steps" aria-hidden="true">{["Discover", "Connect", "Send", "Receive"].map((label, index) => <span key={label} data-current={index === Math.min(phase, 3)} data-complete={index < Math.min(phase, 3)}>{label}</span>)}</div><p role="status" aria-live="polite" aria-atomic="true">{status}</p></div>
    </div>
    <figcaption className="network-caption" id="network-caption"><span><span className="sr-only">Three nearby Windows PCs connected directly. </span><span className="caption-dot"/>Illustrated LAN &middot; actual app, fictional demo data</span>
      <div className="network-controls enhanced-control">
        {preferences.motion && <>
          <motion.button type="button" tabIndex={0} className="scene-control" aria-label={playing ? "Pause network preview" : "Play network preview"} onClick={() => { if (clock.current.progress >= .999) replay(); else setPlaying(value => !value); }} whileTap={reduce ? undefined : {scale: .95}}><Icon name={playing ? "pause" : "play"}/><span>{playing ? "Pause" : "Play"}</span></motion.button>
          <motion.button type="button" tabIndex={0} className="scene-control" aria-label="Replay network preview" onClick={replay} whileTap={reduce ? undefined : {scale: .95}}><Icon name="replay"/><span>Replay</span></motion.button>
        </>}
        {preferences.capable && !unavailable && <button type="button" className="scene-control lighter-control" aria-pressed={lighter} onClick={() => {setLighter(value => !value); setReady(null);}}>{lighter ? "Use 3D" : "Lighter view"}</button>}
      </div>
    </figcaption>
  </figure>;
}
