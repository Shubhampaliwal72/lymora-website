"use client";

import Link from "@/components/site/NavigationLink";
import { useEffect, useRef } from "react";
import { Icon } from "./Icons";

type SectionLink = {href: string; label: string};

/** Native anchors and history, enhanced by one measured sliding selection. */
export function SectionNavigation({items, label, className}: {items: SectionLink[]; label: string; className: string}) {
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = nav.current;
    if (!element) return;
    const indicator = element.querySelector<HTMLElement>(".section-nav-indicator")!;
    const entries = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
      .map(link => ({link, section: document.getElementById(decodeURIComponent(link.hash.slice(1)))}))
      .filter((entry): entry is {link: HTMLAnchorElement; section: HTMLElement} => entry.section !== null);
    if (!entries.length) return;
    type Entry = typeof entries[number];
    let selected: Entry | undefined;
    let pending: Entry | undefined;
    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout>;
    let arrival: Animation | undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const paint = (active: Entry, resize = false) => {
      if (selected === active && !resize) return;
      selected = active;
      entries.forEach(entry => {
        if (entry === active) entry.link.setAttribute("aria-current", "location");
        else entry.link.removeAttribute("aria-current");
      });
      const container = element.getBoundingClientRect();
      const bounds = active.link.getBoundingClientRect();
      Object.assign(indicator.style, {
        transform: `translate3d(${bounds.left-container.left-element.clientLeft+element.scrollLeft}px,${bounds.top-container.top-element.clientTop+element.scrollTop}px,0)`,
        width: `${bounds.width}px`, height: `${bounds.height}px`,
      });
      element.dataset.navReady = "true";
    };
    const update = () => {
      frame = 0;
      const offset = Math.min(innerHeight * .35, 200);
      const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
      const active = pending ?? (atBottom ? entries.at(-1) : entries.findLast(entry => entry.section.getBoundingClientRect().top <= offset)) ?? entries[0];
      paint(active);
    };
    const schedule = () => {if (!frame) frame = requestAnimationFrame(update);};
    const settle = () => {
      clearTimeout(settleTimer);
      if (pending && !reduced.matches) {
        const heading = pending.section.querySelector<HTMLElement>(".guide-heading,.section-heading,.download-overview,h2");
        arrival?.cancel();
        // Individual translate composes with the existing GSAP/Motion transforms.
        arrival = heading?.animate({translate: ["8px 0", "0px 0"]}, {duration: 240, easing: "cubic-bezier(.22,1,.36,1)"});
      }
      pending = undefined;
      update();
    };
    const scroll = () => {schedule();clearTimeout(settleTimer);settleTimer = setTimeout(settle, 140);};
    const request = (entry: Entry) => {
      arrival?.cancel();pending = entry;paint(entry);
      clearTimeout(settleTimer);settleTimer = setTimeout(settle, 160);
    };
    const click = (event: MouseEvent) => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
      const link = event.target.closest("a");
      const entry = entries.find(entry => entry.link === link);
      if (entry) request(entry); // No preventDefault: scrolling, URL and focus stay native.
    };
    const hash = () => {const entry = entries.find(entry => entry.link.hash === location.hash);if (entry) request(entry);else {pending = undefined;schedule();}};
    const interrupt = () => {pending = undefined;arrival?.cancel();schedule();};
    const key = (event: KeyboardEvent) => {if (["PageDown","PageUp","Home","End","ArrowDown","ArrowUp"].includes(event.key)) interrupt();};
    const resize = () => {if (selected) paint(selected, true);schedule();};
    indicator.style.transition = "none";
    update();
    const initialFrame = requestAnimationFrame(() => indicator.style.removeProperty("transition"));
    const observer = new ResizeObserver(resize);
    observer.observe(element);entries.forEach(entry => observer.observe(entry.link));
    element.addEventListener("click", click);
    window.addEventListener("scroll", scroll, {passive: true});
    window.addEventListener("scrollend", settle);
    window.addEventListener("hashchange", hash);
    window.addEventListener("resize", resize);
    window.addEventListener("wheel", interrupt, {passive: true});
    window.addEventListener("touchstart", interrupt, {passive: true});
    window.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(frame);cancelAnimationFrame(initialFrame);clearTimeout(settleTimer);arrival?.cancel();observer.disconnect();
      element.removeEventListener("click", click);window.removeEventListener("scroll", scroll);window.removeEventListener("scrollend", settle);
      window.removeEventListener("hashchange", hash);window.removeEventListener("resize", resize);window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);window.removeEventListener("keydown", key);delete element.dataset.navReady;
    };
  }, [items]);
  return <nav ref={nav} className={className+" section-navigation"} aria-label={label}><span className="section-nav-indicator" aria-hidden="true"/>{items.map(item => item.href.startsWith("#")
    ? <a key={item.href} href={item.href}>{item.label}</a>
    : <Link key={item.href} href={item.href}>{item.label}<Icon name="arrow"/></Link>)}</nav>;
}
