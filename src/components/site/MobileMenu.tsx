"use client";
import { useEffect, useRef } from "react";
import { NavigationItem } from "./NavigationItem";
import { usePathname } from "next/navigation";
import { messenger } from "@/lib/products";
import { useAnimate } from "motion/react";
import { motionTiming } from "@/lib/motion";
import { Icon } from "./Icons";
export function MobileMenu() {
  const details = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const [panel, animate] = useAnimate<HTMLElement>();
  useEffect(() => {
    const close = () => { if (details.current) details.current.open = false; };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.current?.open) {
        close(); details.current.querySelector("summary")?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.current?.contains(event.target)) close();
    };
    const wide = matchMedia("(min-width: 1101px)");
    const resize = () => { if (wide.matches) close(); };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    wide.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      wide.removeEventListener("change", resize);
    };
  }, []);
  useEffect(() => {if(details.current)details.current.open = false;},[pathname]);
  return <details ref={details} className="mobile-menu" onBlur={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }} onToggle={(event) => { if (event.currentTarget.open && panel.current) { const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; if (reduce) return; void animate(panel.current, {opacity: [.75, 1], y: [-6, 0]}, {duration: motionTiming.menu}); } }}>
    <summary className="icon-button" aria-label="Navigation menu" aria-controls="mobile-navigation"><Icon name="menu" className="menu-bars"/><Icon name="close" className="menu-close"/></summary>
    <nav ref={panel} id="mobile-navigation" className="mobile-panel" aria-label="Mobile navigation" onClick={(event) => { if ((event.target as HTMLElement).closest("a") && details.current) details.current.open = false; }}>
      <div className="nav-menu-intro"><span className="eyebrow">Explore Lymora</span><p>Technology, closer.</p></div>
      <NavigationItem href="/" title="Home"/>
      <span className="mobile-nav-label">Products</span>
      <NavigationItem href={messenger.path} title="LAN Messenger" description="Messages, groups and files on your LAN." icon="message"/>
      <NavigationItem href="/products/" title="All products"/>
      <span className="mobile-nav-label">Discover</span>
      <NavigationItem href="/#experience" title="Inside the app"/>
      <NavigationItem href={pathname === "/" ? "#how-it-works" : "/#how-it-works"} title="How it works"/>
      <span className="mobile-nav-label">Resources</span>
      <NavigationItem href={messenger.docs} title="Documentation"/>
      <NavigationItem href={messenger.docs + "#troubleshooting"} title="Help & troubleshooting"/>
      <NavigationItem href={messenger.releases} title="Release notes"/>
      <NavigationItem href="/privacy/" title="Privacy & security"/>
      <NavigationItem href="/about/" title="About Lymora"/>
      <NavigationItem href="/downloads/" title="Downloads" icon="down" className="mobile-download"/>
    </nav>
  </details>;
}
