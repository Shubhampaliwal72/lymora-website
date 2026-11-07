"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";
export function NavDisclosure({label,children}:{label:string;children:ReactNode}) {
  const root = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if(root.current) root.current.open = false;
    const outside = (event: PointerEvent) => {if(event.target instanceof Node && !root.current?.contains(event.target) && root.current) root.current.open = false;};
    const escape = (event: KeyboardEvent) => {if(event.key === "Escape" && root.current?.open){root.current.open = false;root.current.querySelector("summary")?.focus();}};
    document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
    return () => {document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};
  },[pathname]);
  return <details ref={root} className="nav-disclosure" onToggle={event=>{if(event.currentTarget.open)document.querySelectorAll<HTMLDetailsElement>(".nav-disclosure[open]").forEach(item=>{if(item!==event.currentTarget)item.open=false;});}}><summary>{label}<Icon name="down"/></summary><div className="nav-dropdown glass-panel" onClick={event=>{if((event.target as HTMLElement).closest("a") && root.current)root.current.open=false;}}>{children}</div></details>;
}
