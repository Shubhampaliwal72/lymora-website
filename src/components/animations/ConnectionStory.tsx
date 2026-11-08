"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Icon } from "@/components/site/Icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const steps = [
  {title: "Install on both PCs.", icon: "windows", label: "Make yourself at home", body: "Choose a display name and allow local-network messaging. No email, phone number or cloud account is required."},
  {title: "Discover nearby devices.", icon: "expand", label: "Find your people", body: "Open Lymora on a reachable local network. Find the other PC, or use its address when discovery needs help."},
  {title: "Start the conversation.", icon: "message", label: "Your first hello", body: "Send a message, create a group or review a file before sharing. Keep both apps running while you connect."},
] as const;

/** One scroll owner for the connection wires, thread and current setup step. */
export function ConnectionStory() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const element = root.current;
    if (!element) return;
    const panels = Array.from(element.querySelectorAll<HTMLElement>(".connection-step"));
    let current = -1;
    const highlight = () => {
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
    gsap.timeline({scrollTrigger: {trigger: element, start: "top 78%", end: "bottom 65%", scrub: .55, invalidateOnRefresh: true, onUpdate: highlight, onRefresh: highlight}})
      .fromTo(element, {"--connection-left": 0, "--connection-right": 0, "--connection-thread": 0}, {"--connection-left": 1, "--connection-thread": .5, duration: .5, ease: "none"})
      .to(element, {"--connection-right": 1, "--connection-thread": 1, duration: .5, ease: "none"});
    panels.forEach(panel => gsap.from(panel.querySelector(".connection-bubble"), {y: 16, duration: .8, ease: "power3.out", clearProps: "transform", scrollTrigger: {trigger: panel, start: "top 94%", once: true}}));
    let disposed = false;
    void document.fonts.ready.then(() => {if (!disposed) ScrollTrigger.refresh();});
    return () => {disposed = true;};
  }, {scope: root});

  return <div ref={root} className="setup-connection-story" data-active-step="0">
    <div className="connection-route glass-panel" aria-hidden="true">
      <span className="route-device"><Icon name="windows"/>Your PC</span>
      <span className="route-wire route-wire-first"/>
      <span className="route-label">Your local network</span>
      <span className="route-wire route-wire-second"/>
      <span className="route-device"><Icon name="windows"/>Their PC</span>
    </div>
    <ol className="connection-steps" aria-label="Get connected in three steps">
      {steps.map((step, index) => <li key={step.title} className="connection-step" data-state={index === 0 ? "active" : "upcoming"} aria-current={index === 0 ? "step" : undefined}>
        <span className="connection-node" aria-hidden="true">0{index + 1}</span>
        <div className="connection-bubble">
          <div className="connection-step-meta"><span>Step {index + 1} / {step.label}</span><Icon name={step.icon}/></div>
          <h3>{step.title}</h3><p>{step.body}</p>
        </div>
      </li>)}
    </ol>
  </div>;
}
