"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";
export function NavDisclosure({label,children,activePath}:{label:string;children:ReactNode;activePath?:string}) {
  const root = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const id = useId();
  useEffect(() => {
    if(root.current) root.current.open = false;
    const outside = (event: PointerEvent) => {if(event.target instanceof Node && !root.current?.contains(event.target) && root.current) root.current.open = false;};
    const escape = (event: KeyboardEvent) => {if(event.key === "Escape" && root.current?.open){root.current.open = false;root.current.querySelector("summary")?.focus();}};
    const narrow = matchMedia("(max-width: 900px)");
    const resize = () => { if(narrow.matches && root.current) root.current.open = false; };
    narrow.addEventListener("change", resize);
    document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
    return () => {narrow.removeEventListener("change", resize);document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};
  },[pathname]);
  return <details ref={root} data-active={activePath && pathname.startsWith(activePath) ? "true" : undefined} className="nav-disclosure" onBlur={event=>{if(event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget))event.currentTarget.open=false;}} onToggle={event=>{if(event.currentTarget.open)document.querySelectorAll<HTMLDetailsElement>(".nav-disclosure[open]").forEach(item=>{if(item!==event.currentTarget)item.open=false;});}}><summary aria-controls={id}>{label}<Icon name="down"/></summary><div id={id} className="nav-dropdown glass-panel" onClick={event=>{if((event.target as HTMLElement).closest("a") && root.current)root.current.open=false;}}>{children}</div></details>;
}
