import type { MutableRefObject } from "react";

// No Three.js imports here: the lightweight view shares the same finite story.
export type Endpoint = "studio" | "team";
export type Transfer = "message" | "file";
export type Point = [number, number, number];
export type SceneClock = { progress: number };
export type ScenePointer = { x: number; y: number };
export type NetworkCanvasProps = {
  theme: "dark" | "light";
  endpoint: Endpoint;
  transfer: Transfer;
  clock: MutableRefObject<SceneClock>;
  pointer: MutableRefObject<ScenePointer>;
  invalidateRef: MutableRefObject<(() => void) | null>;
  onSelect: (endpoint: Endpoint) => void;
  onReady: () => void;
  onUnavailable: () => void;
};
export const INTRO_DURATION = 6;
export const endpoints = [{id: "studio", name: "Studio PC"}, {id: "team", name: "Team PC"}] as const;
export const devices: {id: Endpoint | "you"; position: Point; rotation: Point; scale: number; app: boolean}[] = [
  {id: "studio", position: [.58, 1.27, -.9], rotation: [-.035, -.22, -.1], scale: .83, app: false},
  {id: "team", position: [2.4, -.58, -.35], rotation: [.015, -.35, .1], scale: .64, app: false},
  {id: "you", position: [-1.05, -.75, 1.05], rotation: [.015, .12, -.035], scale: 1.03, app: true},
];
// Routes attach beside the cases, keeping signals clear of the real app image.
export const routes: Record<Endpoint, [Point, Point, Point, Point]> = {
  studio: [[-2.64, -.9, .9], [-3.2, 2.5, -1.7], [-1.1, 2.7, -1.5], [-.72, 1.35, -.85]],
  team: [[.56, -1.45, 1], [1.8, -2.65, .5], [3.65, -2.1, -.7], [3.43, -.6, -.3]],
};
export const fallbackRoutes: Record<Endpoint, [Point, Point, Point, Point]> = {
  studio: [[365, 465, 0], [140, 175, 0], [340, 70, 0], [490, 210, 0]],
  team: [[570, 560, 0], [730, 780, 0], [1030, 660, 0], [960, 465, 0]],
};
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
export function storyAt(progress: number) {
  const p = clamp(progress);
  return {
    phase: p < .18 ? 0 : p < .36 ? 1 : p < .75 ? 2 : p < .85 ? 3 : 4,
    discover: smooth(p / .18),
    connect: clamp((p - .18) / .18),
    travel: clamp((p - .36) / .39),
    receipt: clamp((p - .8) / .16),
    packet: p >= .36 && p < .75,
    returning: p >= .8 && p < .96,
    arrival: smooth((p - .75) / .1),
  };
}
export function pointOnRoute(points: [Point, Point, Point, Point], progress: number): Point {
  const t = clamp(progress), u = 1 - t;
  return [0, 1, 2].map(axis => u ** 3 * points[0][axis] + 3 * u ** 2 * t * points[1][axis] + 3 * u * t ** 2 * points[2][axis] + t ** 3 * points[3][axis]) as Point;
}
export function svgRoute(points: [Point, Point, Point, Point]) {
  return `M${points[0][0]} ${points[0][1]}C${points[1][0]} ${points[1][1]} ${points[2][0]} ${points[2][1]} ${points[3][0]} ${points[3][1]}`;
}
export const sceneMaterials = {
  dark: {bezel: "#383c44", screen: "#101114", neck: "#42464e", foot: "#343841", status: "#9ccbac", keyLight: "#e5e6ed", accent: "#f06423", signal: "#ffb07c"},
  light: {bezel: "#e5e1dc", screen: "#faf9f7", neck: "#dad6d0", foot: "#dedbd6", status: "#277246", keyLight: "#fff5eb", accent: "#c7470b", signal: "#b8430d"},
} as const;
