"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";
import Link from "@/components/site/NavigationLink";
import { Icon } from "@/components/site/Icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const steps = [
  {title: "Install on both PCs.", icon: "windows", label: "Make yourself at home", body: "Choose a display name and allow local-network messaging. No email, phone number or cloud account is required."},
  {title: "Discover nearby devices.", icon: "expand", label: "Find your people", body: "Open Lymora on a reachable local network. Find the other PC, or use its address when discovery needs help."},
  {title: "Start the conversation.", icon: "message", label: "Your first hello", body: "Send a message, create a group or review a file before sharing. Keep both apps running while you connect."},
] as const;

/** Native vertical reading order, paired with one sticky, perspective-built PC scene. */
export function ConnectionStory() {
  const root = useRef<HTMLDivElement>(null);
  const navigateStep = useRef<((index:number)=>void)|null>(null);
  const {motion, capable} = useScenePreferences();

  useGSAP(() => {
    const element = root.current;
    if (!element) return;
    const panels = Array.from(element.querySelectorAll<HTMLElement>(".connection-step"));
    const activate = (index:number) => {
      element.dataset.activeStep = String(index);
      element.querySelector<HTMLElement>(".connection-device-scene")?.setAttribute("data-active-step",String(index));
      panels.forEach((panel,panelIndex) => {
        panel.dataset.state = panelIndex === index ? "active" : panelIndex < index ? "complete" : "upcoming";
        if (panelIndex === index) panel.setAttribute("aria-current", "step");
        else panel.removeAttribute("aria-current");
      });
      element.querySelectorAll<HTMLButtonElement>("[data-story-go]").forEach((button,buttonIndex) => button.setAttribute("aria-current",buttonIndex === index ? "step" : "false"));
    };

    panels.forEach((panel,index) => {
      ScrollTrigger.create({
        trigger: panel,
        start: "top 62%",
        end: "bottom 62%",
        onEnter: () => activate(index),
        onEnterBack: () => activate(index),
      });
      if (motion) {
        gsap.fromTo(panel,
          {autoAlpha:.48,x:capable?72:24,y:capable?38:16,rotateY:capable?-9:0,transformPerspective:1000,transformOrigin:"50% 60%"},
          {autoAlpha:1,x:0,y:0,rotateY:0,ease:"none",scrollTrigger:{trigger:panel,start:"top 86%",end:"top 58%",scrub:.35,invalidateOnRefresh:true}},
        );
      }
    });

    navigateStep.current = index => {
      const panel = panels[index];
      if (!panel) return;
      activate(index);
      panel.scrollIntoView({behavior:motion?"smooth":"auto",block:"center"});
    };
    activate(0);
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts.ready.then(refresh);
    return () => { navigateStep.current = null; };
  }, {scope:root,dependencies:[motion,capable],revertOnUpdate:true});

  return <div ref={root} className="setup-connection-story" data-active-step="0">
    <div className="connection-story-controls" aria-label="Connection story steps">
      <span className="connection-story-label">People. PCs. One network.</span>
      <nav aria-label="Jump to a connection step">{steps.map((step,index)=><button key={step.label} type="button" data-story-go={index} aria-controls={`connection-step-${index}`} aria-current={index===0?"step":"false"} onClick={()=>navigateStep.current?.(index)}><span>0{index+1}</span>{["Install","Discover","Connect"][index]}</button>)}</nav>
    </div>
    <div className="connection-story-layout">
      <figure className="connection-device-scene" data-active-step="0" aria-label="Two Lymora PCs connect across a local network">
        <figcaption><span className="signal-dot"/>Your local network</figcaption>
        <svg className="connection-device-route" viewBox="0 0 620 400" aria-hidden="true">
          <path className="device-route-base" d="M160 222 C245 110 375 110 460 222"/>
          <path className="device-route-live" d="M160 222 C245 110 375 110 460 222"/>
          <circle className="device-route-node" cx="310" cy="142" r="5"/>
          <circle className="device-route-packet" cx="310" cy="142" r="4"/>
        </svg>
        <div className="pc-monitor pc-monitor-local" aria-hidden="true">
          <div className="pc-bezel"><div className="pc-screen pc-screen-app"/></div>
          <div className="pc-stand"/><div className="pc-base"/>
          <span className="pc-device-label">Your PC <i/></span>
        </div>
        <div className="pc-monitor pc-monitor-peer" aria-hidden="true">
          <div className="pc-bezel"><div className="pc-screen pc-screen-mark"/></div>
          <div className="pc-stand"/><div className="pc-base"/>
          <span className="pc-device-label">Their PC <i/></span>
        </div>
      </figure>
      <ol className="connection-steps" aria-label="Get connected in three steps">
        {steps.map((step,index)=><li key={step.title} id={`connection-step-${index}`} className="connection-step" data-state={index===0?"active":"upcoming"} aria-current={index===0?"step":undefined}>
          <span className="connection-node" aria-hidden="true">0{index+1}</span>
          <div className="connection-bubble glass-panel">
            <div className="connection-step-meta"><span>Step {index+1} / {step.label}</span><Icon name={step.icon}/></div>
            <h3>{step.title}</h3><p>{step.body}</p>
          </div>
        </li>)}
      </ol>
    </div>
    <Link className="connection-story-exit text-link" href="#together">Continue to working together <Icon name="arrow"/></Link>
  </div>;
}
