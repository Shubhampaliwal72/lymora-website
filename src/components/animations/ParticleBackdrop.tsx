"use client";
import dynamic from "next/dynamic";
import {Component,useCallback,useEffect,useMemo,useRef,useState,useId,type CSSProperties,type ReactNode} from "react";
import {usePathname} from "next/navigation";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import {setSceneMotion} from "@/lib/scene-motion";
import {Icon} from "@/components/site/Icons";
import {useScenePreferences} from "@/components/living-network/useScenePreferences";
import type {NetworkCanvasProps} from "@/components/living-network/scene";
import {measureParticleComposition,particleCompositionAt} from "@/lib/particle-composition";
import {createParticlePreview,particleIntensity} from "@/lib/particle-field";
import {ParticleRenderContext,type HeroRegistration,type ParticleRuntime} from "./ParticleRenderContext";

gsap.registerPlugin(useGSAP);
const ParticleCanvas=dynamic(()=>import("./ParticleCanvas"),{ssr:false});
const preview=createParticlePreview();
class ParticleBoundary extends Component<{children:ReactNode;onUnavailable:()=>void},{failed:boolean}> {
  state={failed:false};static getDerivedStateFromError(){return{failed:true};}
  componentDidCatch(){this.props.onUnavailable();}
  render(){return this.state.failed?null:this.props.children;}
}
/** One shared particle scene. The 3D product preview registers with the same renderer. */
export function ParticleBackdrop({children}:{children:ReactNode}) {
  const root=useRef<HTMLDivElement>(null),invalidateRef=useRef<(()=>void)|null>(null);
  const runtime=useRef<ParticleRuntime>({time:0,progress:0,pointer:{x:0,y:0,active:0},layout:{x:.70,y:.43,scale:.72,quiet:.86},visible:true});
  const syncScroll=useRef<(()=>void)|null>(null),scrollEase=useRef<gsap.core.Tween|null>(null);
  const [hero,setHero]=useState<HeroRegistration|null>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  const {capable,motion,visible,theme}=useScenePreferences();
  const paused=!motion;
  const gradient=useId();
  const pathname=usePathname(),intensity=particleIntensity(pathname);
  const register=useCallback((key:symbol,props:NetworkCanvasProps)=>{setHero({key,props});return()=>setHero(current=>current?.key===key?null:current);},[]);
  const onReady=useCallback(()=>setReady(true),[]),onUnavailable=useCallback(()=>{setFailed(true);setReady(false);},[]);
  const enabled=capable&&motion&&!failed;
  const context=useMemo(()=>({enabled,register}),[enabled,register]);
  useGSAP(()=>{
    const progress={value:0};
    let stops=measureParticleComposition(pathname);
    const layout=runtime.current.layout;
    const layoutEase={y:gsap.quickTo(layout,"y",{duration:.95,ease:"power2.out"}),x:gsap.quickTo(layout,"x",{duration:.95,ease:"power2.out"}),scale:gsap.quickTo(layout,"scale",{duration:.95,ease:"power2.out"}),quiet:gsap.quickTo(layout,"quiet",{duration:.95,ease:"power2.out"})};
    const draw=()=>{
      runtime.current.progress=progress.value;
      root.current?.setAttribute("data-progress",progress.value.toFixed(4));
      if(!document.hidden)invalidateRef.current?.();
    };
    // Read the actual current document range. A cached trigger end can become stale
    // while other page sections finish their own text/layout enhancements.
    const ease=gsap.quickTo(progress,"value",{duration:.85,ease:"power2.out",onUpdate:draw});
    scrollEase.current=ease.tween;
    const sample=(immediate=false)=>{
      const composition=particleCompositionAt(stops,scrollY);
      if(immediate||!motion)Object.assign(layout,composition);
      else {layoutEase.y(composition.y);layoutEase.x(composition.x);layoutEase.scale(composition.scale);layoutEase.quiet(composition.quiet);}
      root.current?.style.setProperty("--particle-x",(composition.x*100).toFixed(2)+"%");
      root.current?.style.setProperty("--particle-y",(composition.y*100).toFixed(2)+"%");
      root.current?.style.setProperty("--particle-scale",String(composition.scale));
      if(!motion){progress.value=0;draw();return;}
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      const value=Math.max(0,Math.min(1,scrollY/max));
      if(immediate){ease.tween.pause();progress.value=value;draw();}else ease(value);
    };
    const move=()=>{if(!document.hidden&&root.current?.dataset.paused!=="true")sample();};
    syncScroll.current=move;
    let raf=0;
    const refresh=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{stops=measureParticleComposition(pathname);sample(true);});};
    const observer=new ResizeObserver(refresh);
    const shell=document.querySelector(".site-shell");if(shell)observer.observe(shell);
    window.addEventListener("scroll",move,{passive:true});
    window.addEventListener("resize",refresh,{passive:true});
    window.addEventListener("pageshow",refresh);window.addEventListener("popstate",refresh);
    refresh();
    return()=>{
      cancelAnimationFrame(raf);observer.disconnect();Object.values(layoutEase).forEach(easing=>easing.tween.kill());ease.tween.kill();syncScroll.current=null;scrollEase.current=null;
      window.removeEventListener("scroll",move);window.removeEventListener("resize",refresh);
      window.removeEventListener("pageshow",refresh);window.removeEventListener("popstate",refresh);
    };
  },{scope:root,dependencies:[pathname,motion],revertOnUpdate:true});
  useEffect(()=>{
    runtime.current.visible=visible;
    if(visible&&!paused)syncScroll.current?.();else scrollEase.current?.pause();
    if(!motion||!visible||paused||!enabled)return;
    let lastTime=gsap.ticker.time,lastFrame=-1;
    const tick=(time:number)=>{
      const frame=Math.floor(time*30);
      if(frame===lastFrame)return;lastFrame=frame;
      runtime.current.time+=Math.min(.1,time-lastTime);lastTime=time;
      invalidateRef.current?.();
    };
    gsap.ticker.add(tick);
    return()=>gsap.ticker.remove(tick);
  },[visible,paused,motion,enabled,pathname]);
  useEffect(()=>{
    if(!capable||!motion)return;
    const x=gsap.quickTo(runtime.current.pointer,"x",{duration:1.25,ease:"power3.out"}),y=gsap.quickTo(runtime.current.pointer,"y",{duration:1.25,ease:"power3.out"});
    const active=gsap.quickTo(runtime.current.pointer,"active",{duration:.7,ease:"power2.out"});
    const move=(event:PointerEvent)=>{if(event.pointerType!=="mouse"||paused||document.hidden)return;active(1);x((event.clientX/innerWidth-.5)*2);y((event.clientY/innerHeight-.5)*2);};
    const reset=()=>{x(0);y(0);active(0);};window.addEventListener("pointermove",move,{passive:true});document.documentElement.addEventListener("pointerleave",reset);
    return()=>{window.removeEventListener("pointermove",move);document.documentElement.removeEventListener("pointerleave",reset);x.tween.kill();y.tween.kill();active.tween.kill();};
  },[capable,motion,paused]);
  return <ParticleRenderContext.Provider value={context}>
    <div ref={root} className="particle-backdrop" data-renderer={enabled&&ready?"webgl":"svg"} data-motion={motion?"full":"static"} data-paused={paused} data-hidden={!visible} data-route={pathname} aria-hidden="true" style={{"--particle-intensity":intensity} as CSSProperties}>
      <svg className="particle-fallback" viewBox="0 0 1000 1000" fill="none">
        <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="38%" stopColor="var(--accent)"/><stop offset="62%" stopColor="var(--particle-cool)"/></linearGradient></defs>
        <g className="particle-fallback-cloud" stroke={"url(#"+gradient+")"} strokeLinecap="round">{preview.map((path,index)=><path key={index} d={path} strokeWidth={.9+index*.35} opacity={.32+index*.2}/>)}</g>
      </svg>
      {enabled&&<ParticleBoundary onUnavailable={onUnavailable}><ParticleCanvas runtime={runtime} invalidateRef={invalidateRef} hero={hero} theme={theme} intensity={intensity} onReady={onReady} onUnavailable={onUnavailable}/></ParticleBoundary>}
      <div className="particle-reading-veil"/>
    </div>
    <button type="button" className="ambience-control glass-panel" aria-pressed={paused} onClick={()=>setSceneMotion(motion?"reduced":"full")} aria-label={motion?"Pause animations":"Play animations"} title={motion?"Pause the live scene and scroll animations":"Enable live animation for this website; your device settings stay unchanged"}><Icon name={motion?"pause":"play"}/><span>{motion?"Pause animations":"Play animations"}</span></button>
    {children}
  </ParticleRenderContext.Provider>;
}
