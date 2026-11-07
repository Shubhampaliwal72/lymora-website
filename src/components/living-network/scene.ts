import type { MutableRefObject } from "react";

// GSAP writes only this clock. The renderer derives all 3D geometry from it.
export type SceneClock = { progress: number };
export type ScenePointer = { x: number; y: number };
export type NetworkCanvasProps = {
  theme: "dark" | "light";
  clock: MutableRefObject<SceneClock>;
  pointer: MutableRefObject<ScenePointer>;
  invalidateRef: MutableRefObject<(() => void) | null>;
  onReady: () => void;
  onUnavailable: () => void;
};
export const INTRO_DURATION = 4.5;

export const sceneMaterials = {
  dark: {bezel: "#383c44", screen: "#101114", neck: "#42464e", foot: "#343841", status: "#9ccbac", keyLight: "#e5e6ed", accent: "#f06423", signal: "#ffb07c"},
  light: {bezel: "#e5e1dc", screen: "#faf9f7", neck: "#dad6d0", foot: "#dedbd6", status: "#277246", keyLight: "#fff5eb", accent: "#c7470b", signal: "#b8430d"},
} as const;
