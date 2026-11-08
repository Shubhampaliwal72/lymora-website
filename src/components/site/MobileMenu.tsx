"use client";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";
import { useEffect, useRef } from "react";
import { ActiveLink as Link } from "./ActiveLink";
import { usePathname } from "next/navigation";
import { messenger } from "@/lib/products";
import { useAnimate } from "motion/react";
import { motionTiming } from "@/lib/motion";
import { Icon } from "./Icons";
export function MobileMenu() {
  const details = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const [panel, animate] = useAnimate<HTMLElement>();
  const reduce = !useScenePreferences().motion;
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
    const wide = matchMedia("(min-width: 901px)");
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
  return <details ref={details} className="mobile-menu" onToggle={(event) => { if (event.currentTarget.open && panel.current) void animate(panel.current, {opacity: [reduce ? 1 : .75, 1], y: [reduce ? 0 : -6, 0]}, {duration: reduce ? 0 : motionTiming.menu}); }}>
    <summary className="icon-button" aria-label="Navigation menu" aria-controls="mobile-navigation"><Icon name="menu" className="menu-bars"/><Icon name="close" className="menu-close"/></summary>
    <nav ref={panel} id="mobile-navigation" className="mobile-panel" aria-label="Mobile navigation" onClick={(event) => { if ((event.target as HTMLElement).closest("a") && details.current) details.current.open = false; }}>
      <Link href="/">Home</Link><span className="mobile-nav-label">Products</span><Link href={messenger.path}>LAN Messenger<Icon name="message"/></Link><Link href="/products/">All products<Icon name="arrow"/></Link><span className="mobile-nav-label">Discover Lymora</span><Link href="/#experience">Inside the app</Link><Link href={pathname === "/" ? "#how-it-works" : "/#how-it-works"}>How it works</Link><Link href={messenger.docs}>Documentation</Link><Link href={messenger.docs + "#troubleshooting"}>Help &amp; troubleshooting</Link><Link href="/privacy/">Privacy &amp; security</Link><Link href="/about/">About Lymora</Link><Link href="/downloads/" className="mobile-download">Windows availability<Icon name="arrow"/></Link>
    </nav>
  </details>;
}
