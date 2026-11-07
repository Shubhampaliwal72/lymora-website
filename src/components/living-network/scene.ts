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
// A direct three-peer mesh: screens have distinct space, not overlapping layers.
export const devices: {id: Endpoint; position: Point; rotation: Point; scale: number; app: boolean}[] = [
  {id: "you", position: [-1.6, .05, .6], rotation: [0, .035, 0], scale: 1, app: true},
  {id: "studio", position: [2.25, 1.9, -.45], rotation: [0, -.05, -.015], scale: .65, app: false},
  {id: "team", position: [2.45, -1.4, -.35], rotation: [0, -.05, .015], scale: .65, app: false},
];
export const connections: [Endpoint, Endpoint][] = [["you","studio"],["you","team"],["studio","team"]];
// The same perspective projection positions the SVG computers, routes and DOM labels.
export function projectPoint(point: Point): Point {
  const height=2*Math.tan(35.5*Math.PI/360)*(10.8-point[2]);
  return [500+(point[0]-.35)/height*780,390-(point[1]-.35)/height*780,0];
}
export const illustratedDevices=devices.map(device=>{
  const [x,y]=projectPoint(device.position),height=2*Math.tan(35.5*Math.PI/360)*(10.8-device.position[2]);
  const width=3.35*device.scale/height*780;
  const label=projectPoint([device.position[0],device.position[1]-1.94*device.scale,device.position[2]]);
  return {...device,x,y,width,height:width*2.27/3.35,label};
});
function port(id: Endpoint, other: Endpoint): Point {
  const device=devices.find(item=>item.id===id)!,target=devices.find(item=>item.id===other)!;
  const vertical=Math.abs(target.position[1]-device.position[1])>Math.abs(target.position[0]-device.position[0])*1.5;
  let x=(vertical?.65:Math.sign(target.position[0]-device.position[0])*1.675)*device.scale;
  let y=(vertical?Math.sign(target.position[1]-device.position[1])*1.135:Math.sign(target.position[1]-device.position[1])*.48)*device.scale;
  let z=.08*device.scale;
  const [rx,ry,rz]=device.rotation;
  [x,y]=[x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz)];
  [x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];
  [y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];
  return [x+device.position[0],y+device.position[1],z+device.position[2]];
}
export function routeBetween(source: Endpoint, target: Endpoint, fallback=false): [Point,Point,Point,Point] {
  const pair=connections.find(([a,b])=>(a===source&&b===target)||(b===source&&a===target));
  if(!pair)throw new Error("A route must join two different computers");
  const a=port(pair[0],pair[1]),b=port(pair[1],pair[0]);
  const vertical=pair[0]==="studio"&&pair[1]==="team";
  const points:[Point,Point,Point,Point]=vertical
    ? [a,[3.65,a[1]-.3,.15],[3.65,b[1]+.3,.15],b]
    : [a,[a[0]+(b[0]-a[0])*.38,a[1],a[2]],[a[0]+(b[0]-a[0])*.62,b[1],b[2]],b];
  const directed=source===pair[0]?points:[...points].reverse() as [Point,Point,Point,Point];
  return fallback?directed.map(projectPoint) as [Point,Point,Point,Point]:directed;
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
