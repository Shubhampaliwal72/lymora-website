"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/site/Icons";
import { NetworkFallback } from "./NetworkFallback";
import { useScenePreferences } from "./useScenePreferences";
import { INTRO_DURATION, type SceneClock, type ScenePointer } from "./scene";

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
  const timeline = useRef<gsap.core.Tween | null>(null);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [intersecting, setIntersecting] = useState(true);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState<"dark" | "light" | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [lighter, setLighter] = useState(false);
  const preferences = useScenePreferences();
  const reduce = useReducedMotion();
  const onReady = useCallback(() => setReady(preferences.theme), [preferences.theme]);
  const onUnavailable = useCallback(() => { setUnavailable(true); setReady(null); }, []);
  const canvas = preferences.capable && load && !lighter && !unavailable;
  const active = playing && preferences.visible && intersecting && preferences.motion;
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setLoad(true)); });
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), {threshold: .05});
    if (root.current) observer.observe(root.current);
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); observer.disconnect(); };
  }, []);
  useGSAP(() => {
    if (!preferences.motion) { clock.current.progress = 1; return; }
    clock.current.progress = 0;
    timeline.current = gsap.to(clock.current, {progress: 1, duration: INTRO_DURATION, ease: "none", paused: true, onUpdate: () => invalidate.current?.(), onComplete: () => setPlaying(false)});
    return () => { timeline.current = null; };
  }, {scope: root, dependencies: [run, preferences.motion], revertOnUpdate: true});
  useEffect(() => { timeline.current?.paused(!active); }, [active, run]);
  const replay = () => { setPlaying(true); setRun(value => value + 1); };
  const move = (event: React.PointerEvent<HTMLElement>) => {
    if (!canvas || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    pointer.current.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    invalidate.current?.();
  };
  return <figure ref={root} className="living-network" data-mode={canvas && ready === preferences.theme ? "3d" : "illustrated"} onPointerMove={move} onPointerLeave={() => {pointer.current.x = 0; pointer.current.y = 0; invalidate.current?.();}} aria-labelledby="network-caption">
    <div className="network-world">
      <NetworkFallback animated={preferences.motion && !(canvas && ready === preferences.theme)} playing={active} run={run} />
      {canvas && <SceneBoundary onUnavailable={onUnavailable}><NetworkCanvas theme={preferences.theme} clock={clock} pointer={pointer} invalidateRef={invalidate} onReady={onReady} onUnavailable={onUnavailable} /></SceneBoundary>}
      <span className="network-device-label device-label-studio" aria-hidden="true">Studio PC</span>
      <span className="network-device-label device-label-team" aria-hidden="true">Team PC</span>
      <span className="network-device-label device-label-you" aria-hidden="true">Your PC</span>
    </div>
    <figcaption className="network-caption" id="network-caption"><span><span className="sr-only">Three nearby Windows PCs connected directly. </span><span className="caption-dot"/>Illustrated LAN &middot; actual app capture, test data</span>
      <div className="network-controls enhanced-control">
        {preferences.motion && <>
          <motion.button type="button" className="scene-control" aria-label={playing ? "Pause network preview" : "Play network preview"} onClick={() => { if (clock.current.progress >= .999) replay(); else setPlaying(value => !value); }} whileTap={reduce ? undefined : {scale: .95}}><Icon name={playing ? "pause" : "play"}/><span>{playing ? "Pause" : "Play"}</span></motion.button>
          <motion.button type="button" className="scene-control" aria-label="Replay network preview" onClick={replay} whileTap={reduce ? undefined : {scale: .95}}><Icon name="replay"/><span>Replay</span></motion.button>
        </>}
        {preferences.capable && !unavailable && <button type="button" className="scene-control lighter-control" aria-pressed={lighter} onClick={() => {setLighter(value => !value); setReady(null);}}>{lighter ? "Use 3D" : "Lighter view"}</button>}
      </div>
    </figcaption>
  </figure>;
}
