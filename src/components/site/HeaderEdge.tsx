"use client";

import { useEffect, useRef } from "react";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";

/** A measured pill-shaped path keeps the beam on the border at every width. */
export function HeaderEdge() {
  const svg = useRef<SVGSVGElement>(null);
  const {visible} = useScenePreferences();
  useEffect(() => {
    const element = svg.current;
    const header = element?.parentElement;
    if (!element || !header) return;
    const measure = () => {
      const {width, height} = header.getBoundingClientRect();
      element.setAttribute("viewBox", "0 0 " + width + " " + height);
      element.querySelectorAll("rect").forEach(rect => {
        rect.setAttribute("width", String(Math.max(0, width - 2)));
        rect.setAttribute("height", String(Math.max(0, height - 2)));
        rect.setAttribute("rx", String(Math.max(0, (height - 2) / 2)));
      });
      element.dataset.ready = "true";
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return <svg ref={svg} className="header-edge" data-paused={!visible} aria-hidden="true" focusable="false"><rect className="header-edge-trail" x="1" y="1" pathLength="1000"/><rect className="header-edge-head" x="1" y="1" pathLength="1000"/></svg>;
}
