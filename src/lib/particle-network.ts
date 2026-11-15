import { BufferGeometry, Float32BufferAttribute } from "three";
import type { createParticleField } from "./particle-field";

type Field = ReturnType<typeof createParticleField>;
export type ParticleTransmission = {edge: number; from: number; to: number};

/** A connected, sparse graph attached to exact particles, not floating overlay lines. */
export function createParticleNetwork(field: Field) {
  const count = field.ring.length / 3;
  const nodeCount = 14;
  const nodes: number[] = [];
  for (let node = 0; node < nodeCount; node++) {
    const y = 1 - 2 * (node + .5) / nodeCount;
    const radius = Math.sqrt(1 - y * y);
    const angle = node * Math.PI * (3 - Math.sqrt(5));
    const target = [Math.cos(angle) * radius * 2.45, y * 2.45, Math.sin(angle) * radius * 2.45];
    let nearest = -1, distance = Infinity;
    for (let i = 0; i < count; i++) {
      if (i % 7 === 0 || field.seeds[i * 3 + 1] > .97 || nodes.includes(i)) continue;
      const offset = i * 3;
      const d = (field.orb[offset] - target[0]) ** 2 + (field.orb[offset + 1] - target[1]) ** 2 + (field.orb[offset + 2] - target[2]) ** 2;
      if (d < distance) {distance = d; nearest = i;}
    }
    nodes.push(nearest);
  }
  const candidates: {a: number; b: number; distance: number}[] = [];
  for (let a = 0; a < nodeCount; a++) for (let b = a + 1; b < nodeCount; b++) {
    let distance = 0;
    for (let axis = 0; axis < 3; axis++) distance += (field.orb[nodes[a] * 3 + axis] - field.orb[nodes[b] * 3 + axis]) ** 2;
    candidates.push({a, b, distance});
  }
  candidates.sort((a, b) => a.distance - b.distance);
  const edges: {a: number; b: number}[] = [];
  const keys = new Set<number>();
  const add = (a: number, b: number) => {
    const key = a * nodeCount + b;
    if (!keys.has(key)) {keys.add(key); edges.push({a, b});}
  };
  // A minimum spanning tree guarantees one network, then short local links add depth.
  const parents = Array.from({length: nodeCount}, (_, i) => i);
  const root = (node: number): number => parents[node] === node ? node : root(parents[node]);
  for (const {a, b} of candidates) if (root(a) !== root(b)) {parents[root(a)] = root(b); add(a, b);}
  for (let node = 0; node < nodeCount; node++) candidates.filter(edge => edge.a === node || edge.b === node).slice(0, 2).forEach(edge => add(edge.a, edge.b));
  const signals = new Float32Array(count);
  nodes.forEach((index, node) => {signals[index] = node + 1;});
  const geometry = new BufferGeometry();
  const sources = {position: field.ring, aLogo: field.ring, aOrb: field.orb, aGalaxy: field.galaxy, aSeed: field.seeds};
  for (const [name, source] of Object.entries(sources)) {
    const values: number[] = [];
    for (const edge of edges) for (const node of [edge.a, edge.b]) values.push(...source.subarray(nodes[node] * 3, nodes[node] * 3 + 3));
    geometry.setAttribute(name, new Float32BufferAttribute(values, 3));
  }
  const routes: number[] = [], nodeIds: number[] = [];
  edges.forEach((edge, index) => {routes.push(0, index, 1, index); nodeIds.push(edge.a + 1, edge.b + 1);});
  geometry.setAttribute("aRoute", new Float32BufferAttribute(routes, 2));
  geometry.setAttribute("aSignal", new Float32BufferAttribute(nodeIds, 1));
  const transmissions: ParticleTransmission[] = [];
  const visited = new Set<number>();
  const walk = (node: number) => {
    edges.forEach((edge, index) => {
      if (visited.has(index) || (edge.a !== node && edge.b !== node)) return;
      visited.add(index);
      const next = edge.a === node ? edge.b : edge.a;
      transmissions.push({edge: index, from: node + 1, to: next + 1});
      walk(next);
      transmissions.push({edge: index, from: next + 1, to: node + 1});
    });
  };
  walk(0);
  return {geometry, signals, transmissions, nodeCount, edgeCount: edges.length};
}
