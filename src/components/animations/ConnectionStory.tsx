"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";
import { ConnectionNetwork, paintConnectionNetwork } from "./ConnectionNetwork";
import Link from "@/components/site/NavigationLink";
import { Icon } from "@/components/site/Icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const steps = [
  {title: "Install on both PCs.", icon: "windows", label: "Make yourself at home", body: "Choose a display name and allow local-network messaging. No email, phone number or cloud account is required."},
  {title: "Discover nearby devices.", icon: "expand", label: "Find your people", body: "Open Lymora on a reachable local network. Find the other PC, or use its address when discovery needs help."},
  {title: "Start the conversation.", icon: "message", label: "Your first hello", body: "Send a message, create a group or review a file before sharing. Keep both apps running while you connect."},
] as const;

/** The route completes independently. A bounded desktop story explains what connects people. */
export function ConnectionStory() {
  const root = useRef<HTMLDivElement>(null);
  const visual = useRef<SVGSVGElement>(null);
  const navigateStep = useRef<((index:number)=>void)|null>(null);
  const {motion, capable} = useScenePreferences();
  useGSAP(() => {
    const element = root.current;
    const diagram = element?.querySelector<HTMLElement>(".connection-diagram");
    const walkthrough = element?.querySelector<HTMLElement>(".connection-steps");
    if (!element || !diagram || !walkthrough) return;
    const panels = Array.from(element.querySelectorAll<HTMLElement>(".connection-step"));
    let current = -1;
    const highlight = () => {
      if(element.dataset.storyMode === "cinematic")return;
      const focus = innerHeight * .6;
      const distances = panels.map(panel => Math.abs(panel.getBoundingClientRect().top + panel.offsetHeight / 2 - focus));
      const active = distances.indexOf(Math.min(...distances));
      if (active === current) return;
      current = active;
      element.dataset.activeStep = String(active);
      panels.forEach((panel, index) => {
        panel.dataset.state = index === active ? "active" : index < active ? "complete" : "upcoming";
        if (index === active) panel.setAttribute("aria-current", "step");
        else panel.removeAttribute("aria-current");
      });
    };
    if (!motion) {
      gsap.set(diagram, {"--connection-left": 1, "--connection-right": 1});
      gsap.set(element, {"--connection-thread": 1});
      ScrollTrigger.create({trigger: walkthrough, start: "top 78%", end: "bottom 65%", onUpdate: highlight, onRefresh: highlight});
      return;
    }
    // Complete both wires while the whole diagram is still comfortably visible.
    gsap.timeline({scrollTrigger: {trigger: diagram, start: "top 82%", end: "top 42%", scrub: .3, invalidateOnRefresh: true}})
      .fromTo(diagram, {"--connection-left": 0, "--connection-right": 0}, {"--connection-left": 1, duration: .5, ease: "none"})
      .to(diagram, {"--connection-right": 1, duration: .5, ease: "none"});
    gsap.fromTo(element, {"--connection-thread": 0}, {"--connection-thread": 1, ease: "none", scrollTrigger: {trigger: walkthrough, start: "top 78%", end: "bottom 65%", scrub: .55, invalidateOnRefresh: true, onUpdate: highlight, onRefresh: highlight}});
    const media = gsap.matchMedia();
    media.add("(min-width: 1000px) and (min-height: 720px)", () => {
      if (!capable || !visual.current) return;
      const stage=element.querySelector<HTMLElement>(".connection-chapter-stage");
      if (!stage) return;
      // This controller owns only the chapter stage. No wheel/touch interception.
      const model={progress:0};
      const draw=()=>{
        const p=model.progress, active=p<.34?0:p<.71?1:2;
        element.dataset.activeStep=String(active);
        element.style.setProperty("--story-progress",String(p));
        panels.forEach((panel,index)=>{
          panel.dataset.state=index===active?"active":index<active?"complete":"upcoming";
          if(index===active)panel.setAttribute("aria-current","step");else panel.removeAttribute("aria-current");
        });
        element.querySelectorAll<HTMLButtonElement>("[data-story-go]").forEach((button,index)=>button.setAttribute("aria-current",index===active?"step":"false"));
        if(visual.current)paintConnectionNetwork(visual.current,p);
      };
      element.dataset.storyMode="cinematic";
      const timeline=gsap.timeline({scrollTrigger:{id:"connection-story",trigger:stage,start:()=>"top "+((document.querySelector(".header-inner")?.getBoundingClientRect().bottom??100)+20),end:()=>"+="+Math.round(innerHeight*1.8),pin:true,scrub:.35,anticipatePin:1,invalidateOnRefresh:true},onUpdate:draw});
      timeline.to(model,{progress:1,duration:1,ease:"none"},0);
      gsap.set(panels,{autoAlpha:0,y:62,rotationX:-9,transformPerspective:1100});
      gsap.set(panels[0],{autoAlpha:1,y:0,rotationX:0});
      [.28,.65].forEach((at,index)=>{
        timeline.to(panels[index],{autoAlpha:0,y:-52,rotationX:7,duration:.1,ease:"power1.inOut"},at)
          .to(panels[index+1],{autoAlpha:1,y:0,rotationX:0,duration:.12,ease:"power2.out"},at+.015);
      });
      navigateStep.current=index=>{
        const trigger=timeline.scrollTrigger;
        if(trigger)window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*[.12,.5,.9][index],behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
      };
      timeline.progress(timeline.scrollTrigger?.progress??0);draw();
      return()=>{
        navigateStep.current=null;
        delete element.dataset.storyMode;
        element.style.removeProperty("--story-progress");
        if(visual.current)paintConnectionNetwork(visual.current,1);
      };
    });
    let disposed = false;
    void document.fonts.ready.then(() => {if (!disposed) ScrollTrigger.refresh();});
    return () => {disposed = true;media.revert();navigateStep.current=null;};
  }, {scope: root, dependencies: [motion, capable], revertOnUpdate: true});

  return <div ref={root} className="setup-connection-story" data-active-step="0">
    <figure className="connection-diagram">
      <figcaption className="connection-diagram-caption">The local connection</figcaption>
      <div className="connection-route glass-panel" role="img" aria-label="Your PC connects to their PC over your local network">
        <span className="route-device"><Icon name="windows"/>Your PC</span>
        <span className="route-wire route-wire-first"/>
        <span className="route-label">Your local network</span>
        <span className="route-wire route-wire-second"/>
        <span className="route-device"><Icon name="windows"/>Their PC</span>
      </div>
    </figure>
    <div className="connection-walkthrough">
      <div className="connection-chapter-stage">
        <nav className="connection-story-controls" aria-label="Choose a connection step">
          <span className="connection-story-label">People. PCs. One network.</span>
          <div>{steps.map((step,index)=><button key={step.label} type="button" data-story-go={index} aria-controls={"connection-step-"+index} aria-label={'Step '+(index+1)+': '+step.title} onClick={()=>navigateStep.current?.(index)}><span>0{index+1}</span>{['Install','Discover','Connect'][index]}</button>)}</div>
        </nav>
        <div className="connection-story-scene">
      <ol className="connection-steps" aria-label="Get connected in three steps">
        {steps.map((step, index) => <li key={step.title} id={"connection-step-"+index} className="connection-step" data-state={index === 0 ? "active" : "upcoming"} aria-current={index === 0 ? "step" : undefined}>
          <span className="connection-node" aria-hidden="true">0{index + 1}</span>
          <div className="connection-bubble">
            <div className="connection-step-meta"><span>Step {index + 1} / {step.label}</span><Icon name={step.icon}/></div>
            <h3>{step.title}</h3><p>{step.body}</p>
          </div>
        </li>)}
      </ol>
          <figure className="connection-network-figure">
            <ConnectionNetwork ref={visual}/>
            <figcaption>Illustrated local connection. People behind the PCs.</figcaption>
          </figure>
        </div>
        <Link className="connection-story-exit text-link" href="#together">Continue to working together <Icon name="arrow"/></Link>
      </div>
    </div>
  </div>;
}
