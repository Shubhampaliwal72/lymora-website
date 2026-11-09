"use client";

import Link from "@/components/site/NavigationLink";
import { useEffect, useRef } from "react";
import { Icon } from "./Icons";

type SectionLink = {href: string; label: string};

/** Native anchors still work without JavaScript; scroll tracking only adds wayfinding. */
export function SectionNavigation({items, label, className}: {items: SectionLink[]; label: string; className: string}) {
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = nav.current;
    if (!element) return;
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const entries = links.map(link => ({link, section: document.getElementById(link.hash.slice(1))})).filter(entry => entry.section !== null);
    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = Math.min(innerHeight * .35, 200);
      const active = entries.findLast(entry => entry.section!.getBoundingClientRect().top <= offset) ?? entries[0];
      entries.forEach(entry => {
        if (entry === active) entry.link.setAttribute("aria-current", "location");
        else entry.link.removeAttribute("aria-current");
      });
    };
    const schedule = () => {if (!frame) frame = requestAnimationFrame(update);};
    update();
    window.addEventListener("scroll", schedule, {passive: true});
    window.addEventListener("resize", schedule);
    return () => {cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);};
  }, [items]);
  return <nav ref={nav} className={className} aria-label={label}>{items.map(item => item.href.startsWith("#")
    ? <a key={item.href} href={item.href}>{item.label}</a>
    : <Link key={item.href} href={item.href}>{item.label}<Icon name="arrow"/></Link>)}</nav>;
}
