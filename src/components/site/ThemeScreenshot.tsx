"use client";
import Image from "next/image";
import { useSyncExternalStore } from "react";

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const system = matchMedia("(prefers-color-scheme: dark)");
  system.addEventListener("change", callback);
  return () => { observer.disconnect(); system.removeEventListener("change", callback); };
}
function themeSnapshot(): "dark" | "light" {
  const theme = document.documentElement.dataset.theme;
  return theme === "dark" || theme === "light" ? theme : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
const serverSnapshot = () => null;

/** Native picture selects one system-theme image before JS; saved site choices follow on hydration. */
export function ThemeScreenshot({view,alt,sizes="(max-width: 900px) 92vw, 1100px"}:{view:"chats"|"groups"|"files"|"network";alt:string;sizes?:string}) {
  const theme = useSyncExternalStore(subscribeTheme, themeSnapshot, serverSnapshot);
  const media = theme === "dark" ? "all" : theme === "light" ? "not all" : "(prefers-color-scheme: dark)";
  return <div className="theme-screenshot"><picture>
    <source media={media} srcSet={"/media/product/"+view+"-dark.png"}/>
    <Image src={"/media/product/"+view+"-light.png"} width={1800} height={1020} alt={alt} sizes={sizes}/>
  </picture></div>;
}
