import type { SVGProps } from "react";
type IconName = "expand" | "sun" | "moon" | "menu" | "close" | "arrow" | "down" | "replay" | "windows" | "pause" | "play" | "message" | "file";
const paths: Record<IconName, React.ReactNode> = {
  expand: <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/>,
  message: <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2Z"/>,
  file: <><path d="M5 3h9l5 5v13H5Z"/><path d="M14 3v6h5M9 13h6M9 17h6"/></>,
  pause: <path d="M9 5v14M15 5v14"/>,
  play: <path d="m8 5 11 7-11 7Z"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
  moon: <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  arrow: <path d="M6 18 18 6M6 6h12v12"/>,
  down: <path d="M12 4v16m-6-6 6 6 6-6"/>,
  replay: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/></>,
  windows: <><path d="m3 5 8-1v7H3Zm10-1 8-1v8h-8ZM3 13h8v7l-8-1Zm10 0h8v8l-8-1Z"/></>,
};
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
