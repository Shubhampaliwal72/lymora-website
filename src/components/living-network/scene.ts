import type { MutableRefObject } from "react";

// No Three.js imports here: the lightweight view shares the same finite story.
export type Endpoint = "you" | "studio" | "team";
export type Transfer = "message" | "file";
export type Point = [number, number, number];
export type SceneClock = { progress: number };
export type ScenePointer = { x: number; y: number };
export type NetworkCanvasProps = {
  theme: "dark" | "light";
  endpoint: Endpoint;
  source: Endpoint;
  transfer: Transfer;
  clock: MutableRefObject<SceneClock>;
  pointer: MutableRefObject<ScenePointer>;
  invalidateRef: MutableRefObject<(() => void) | null>;
  onSelect: (endpoint: Endpoint) => void;
  onReady: () => void;
  onUnavailable: () => void;
};
export const INTRO_DURATION = 6;
export const endpoints = [{id: "you", name: "Your PC"}, {id: "studio", name: "Studio PC"}, {id: "team", name: "Team PC"}] as const;
export const devices: {id: Endpoint | "you"; position: Point; rotation: Point; scale: number; app: boolean}[] = [
  {id: "studio", position: [.58, 1.27, -.9], rotation: [-.035, -.22, -.1], scale: .83, app: false},
  {id: "team", position: [2.4, -.58, -.35], rotation: [.015, -.35, .1], scale: .64, app: false},
  {id: "you", position: [-1.05, -.75, 1.05], rotation: [.015, .12, -.035], scale: 1.03, app: true},
];
// Edge ports sit on each monitor bezel; reversing a path preserves its endpoints.
export const connections: [Endpoint, Endpoint][] = [["you","studio"],["you","team"],["studio","team"]];
function port(id: Endpoint, other: Endpoint): Point {
  const device=devices.find(item=>item.id===id)!;
  const target=devices.find(item=>item.id===other)!;
  const side=target.position[0]>device.position[0]?1:-1;
  let x=side*1.68*device.scale, y=-.52*device.scale, z=.08*device.scale;
  const [rx,ry,rz]=device.rotation;
  [x,y]=[x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz)];
  [x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];
  [y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];
  return [x+device.position[0],y+device.position[1],z+device.position[2]];
}
export function routeBetween(source: Endpoint, target: Endpoint, fallback=false): [Point,Point,Point,Point] {
  if(fallback){
    const ports:Record<Endpoint,Point>={you:[570,465,0],studio:[490,210,0],team:[790,465,0]};
    const a=ports[source],b=ports[target];
    return [a,[a[0],a[1]-130,0],[b[0],b[1]-130,0],b];
  }
  const a=port(source,target),b=port(target,source);
  const lift=source==="you"||target==="you"?-.6:.55;
  return [a,[a[0]+(b[0]-a[0])*.28,a[1]+lift,a[2]-.3],[a[0]+(b[0]-a[0])*.72,b[1]+lift,b[2]-.3],b];
}
export function nextPair(previous: [Endpoint,Endpoint]): [Endpoint,Endpoint] {
  const choices=connections.flatMap(([a,b]):[Endpoint,Endpoint][]=>[[a,b],[b,a]]).filter(([a,b])=>a!==previous[0]||b!==previous[1]);
  return choices[Math.floor(Math.random()*choices.length)];
}
export function arrivalPulse(progress:number){return Math.sin(Math.PI*clamp((progress-.75)/.23));}
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
