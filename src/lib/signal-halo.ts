import { networkDepthGLSL } from "./network-depth";
import { BufferGeometry, Float32BufferAttribute, DoubleSide, ShaderMaterial } from "three";

/** Two closed ribbon surfaces share one geometry and material. */
export function createSignalHaloGeometry() {
  const segments = 384, across = 6;
  const coordinates: number[] = [], indices: number[] = [];
  for (let layer = 0; layer < 2; layer++) {
    const offset = coordinates.length / 3;
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= across; j++) coordinates.push(i / segments, j / across * 2 - 1, layer);
    }
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < across; j++) {
        const a = offset + i * (across + 1) + j, b = a + across + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(coordinates.length), 3));
  geometry.setAttribute("aCoord", new Float32BufferAttribute(coordinates, 3));
  geometry.setIndex(indices);
  return geometry;
}

const vertexShader = /* glsl */ `
attribute vec3 aCoord;
uniform float uTime;
uniform float uMorph;
varying float vDepth;
${networkDepthGLSL}
varying vec3 vNormal;
varying vec3 vCoord;
varying float vPalette;
void main() {
  float angle = aCoord.x * 6.2831853;
  float phase = aCoord.z * 3.1415926;
  float twist = angle * 3.0 + uTime * 0.18 + phase;
  float radius = 2.65 + sin(angle*3.0 + uTime*0.24 + phase)*0.10 + aCoord.y*0.14;
  vec3 p = vec3(cos(angle)*radius*1.12, sin(angle)*radius,
    sin(angle*2.0 + uTime*0.18 + phase)*0.45 + aCoord.y*cos(twist)*0.24);
  vNormal = normalize(normalMatrix * vec3(cos(angle)*sin(twist),sin(angle)*sin(twist),cos(twist)));
  vDepth = networkDepth(p);
  p = networkProjection(p,uMorph);
  vCoord = aCoord;
  vPalette = smoothstep(-1.3, 1.3, p.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
}
`;
const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uMorph;
varying float vDepth;
uniform float uHalo;
uniform float uIntensity;
uniform float uQuiet;
uniform vec3 uWarm;
uniform vec3 uCool;
varying vec3 vNormal;
varying vec3 vCoord;
varying float vPalette;
void main() {
  float presence = uHalo * (1.0-smoothstep(0.15,0.95,uMorph));
  if(presence<0.002)discard;
  vec3 normal = normalize(vNormal);
  float light = abs(dot(normal,normalize(vec3(-0.55,0.8,1.0))));
  float reflection = pow(light,18.0);
  float edge = pow(abs(vCoord.y),12.0);
  float circuit = fract(vCoord.x-uTime*0.025-vCoord.z*0.46);
  float distance = min(circuit,1.0-circuit);
  float packet = exp(-distance*distance*14000.0) * (0.4+edge*0.6);
  vec3 color = mix(uCool,uWarm,vPalette);
  color = mix(color,vec3(1.0,0.93,0.84),reflection*0.42+packet*0.35);
  float alpha = (0.07+edge*0.28+reflection*0.12+packet*0.32)*presence*uIntensity*uQuiet*mix(0.75,1.0,vDepth);
  gl_FragColor = vec4(color,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Shared uniform objects keep the ribbons on the particle clock without another frame loop. */
export function createSignalHaloMaterial(particles: ShaderMaterial) {
  return new ShaderMaterial({
    uniforms: particles.uniforms, vertexShader, fragmentShader,
    transparent: true, depthWrite: false, depthTest: false, side: DoubleSide,
    blending: particles.blending,
  });
}
