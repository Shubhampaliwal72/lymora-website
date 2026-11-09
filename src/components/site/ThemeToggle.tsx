"use client";
import { useEffect, useRef } from "react";
import { Icon } from "./Icons";

export const THEME_KEY = "lymora-website-theme";
function storedTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}
export function ThemeToggle() {
  const button = useRef<HTMLButtonElement>(null);
  const describe = (theme: string) => {
    const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    button.current?.setAttribute("aria-label", label);
    button.current?.setAttribute("title", label);
  };
  useEffect(() => {
    const system = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const saved = storedTheme();
      document.documentElement.dataset.theme = saved === "dark" || saved === "light" ? saved : system.matches ? "dark" : "light";
      describe(document.documentElement.dataset.theme);
    };
    sync();
    system.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => { system.removeEventListener("change", sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = () => {
    const root = document.documentElement;
    const current = root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    describe(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* Theme still works if storage is blocked. */ }
  };
  return <button ref={button} className="icon-button enhanced-control" type="button" aria-label="Switch color theme" title="Switch color theme" onClick={toggle}><Icon name="sun" className="theme-sun"/><Icon name="moon" className="theme-moon"/></button>;
}
