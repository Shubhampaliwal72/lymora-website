import { networkDepthGLSL } from "./network-depth";

/* GPU shape/depth evaluation is shared by points and their exact connected endpoints. */
export const particleVertex = /* glsl */ `
attribute vec3 aOrb;
attribute vec3 aGalaxy;
attribute vec3 aLogo;
attribute vec3 aSeed;
attribute float aSignal;
uniform float uTime;
uniform float uMorph;
uniform float uDpr;
uniform float uLogoReady;
uniform float uHalo;
uniform vec2 uPointer;
uniform float uInteraction;
uniform vec3 uWarm;
uniform vec3 uCool;
uniform vec4 uRouting;
varying vec3 vColor;
varying float vAlpha;
varying float vDepth;
varying float vSignal;
#ifdef ROUTE_PASS
attribute vec2 aRoute;
varying vec2 vRoute;
#endif
${networkDepthGLSL}
void main() {
  float angle = aSeed.z * 6.2831853;
  vec3 ring = position;
  float ripple = sin(angle * 7.0 + uTime * 0.53) * 0.045
    + cos(angle * 4.0 - uTime * 0.31 + aSeed.x * 4.0) * 0.025;
  ring.xy *= 1.0 + ripple;
  ring.z += sin(angle * 5.0 + uTime * 0.37) * 0.12;
  vec3 orb = aOrb * (1.0 + 0.038 * sin(aOrb.y * 2.4 + uTime * 0.6)
    + 0.012 * sin(atan(aOrb.z,aOrb.x)*4.0-uTime*0.25));
  vec3 galaxy = aGalaxy;
  float spin = uTime * 0.035;
  galaxy.xy = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * galaxy.xy;
  vec3 p = mix(ring, orb, smoothstep(0.0, 0.88, uMorph));
  p = mix(p, galaxy, smoothstep(1.2, 1.8, uMorph));
  float formation = smoothstep(1.82, 2.0, uMorph) * uLogoReady;
  p.x *= 1.0 + uHalo*0.12*(1.0-formation);
  p = mix(p, aLogo, formation);
  vec2 delta = p.xy - uPointer;
  float influence = exp(-dot(delta, delta) * 1.8) * uInteraction * (1.0 - formation);
  p.xy += normalize(delta + vec2(0.001)) * influence * 0.14;
  p.z += influence * (0.24 + sin(angle * 5.0 + uTime) * 0.12);
  float mist = smoothstep(0.978, 0.991, aSeed.y) * uInteraction * (1.0 - formation);
  vec3 wisp = vec3(uPointer + vec2(cos(angle + uTime * 0.24), sin(angle * 2.0 - uTime * 0.19))
    * (0.09 + aSeed.x * 0.30), sin(angle * 3.0 + uTime * 0.4) * 0.23);
  p = mix(p, wisp, mist);
  float depth = networkDepth(p);
  float presence = networkPresence(uMorph);
  float forward = step(uRouting.z, uRouting.w);
  float travel = mix(1.0-uRouting.y, uRouting.y, forward);
  float source = 1.0-step(0.1,abs(aSignal-uRouting.z));
  float target = 1.0-step(0.1,abs(aSignal-uRouting.w));
  float dispatch = exp(-pow(travel,2.0)*190.0);
  float arrival = exp(-pow(travel-1.0,2.0)*190.0);
  float pulse = (source*dispatch+target*arrival)*presence;
  float node = step(0.5,aSignal)*presence;
  p = networkProjection(p,uMorph);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  float size = (1.3+aSeed.x*1.8+influence*0.3)*mix(0.72,1.16,depth);
  size = mix(size,1.3+aSeed.x*1.8,formation);
  gl_PointSize = mix(size,4.0+pulse*1.3,node)*uDpr;
  float palette = mix(smoothstep(-0.8, 0.8, p.y), 0.9, formation);
  vColor = mix(uCool,uWarm,palette);
  vColor = mix(vColor,vec3(1.0,0.94,0.86),pow(aSeed.y,16.0)*0.28*depth+pulse*0.55);
  float depthWeight = mix(0.35,1.0,smoothstep(0.15,0.8,uMorph));
  vAlpha = (0.22+aSeed.y*0.6)*mix(1.0,mix(0.42,1.0,depth),depthWeight)+node*0.16+pulse*0.45;
  // The original logo returns to a flat, crisp silhouette at the end.
  vAlpha = mix(vAlpha,0.22+aSeed.y*0.6,formation);
  vDepth = depth;
  vSignal = node;
  #ifdef ROUTE_PASS
  vRoute = aRoute;
  #endif
}
`;
export const particleFragment = /* glsl */ `
uniform float uIntensity;
uniform float uQuiet;
varying vec3 vColor;
varying float vAlpha;
varying float vDepth;
varying float vSignal;
void main() {
  vec2 p = gl_PointCoord-0.5;
  float r = dot(p,p);
  if(r>0.25)discard;
  float light = exp(-r*mix(14.0,26.0,vDepth))+exp(-r*8.0)*0.25;
  light += exp(-r*65.0)*vSignal*0.35;
  gl_FragColor = vec4(vColor,light*vAlpha*uIntensity*uQuiet);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
export const particleRouteFragment = /* glsl */ `
uniform float uMorph;
uniform float uIntensity;
uniform float uQuiet;
uniform vec4 uRouting;
varying vec3 vColor;
varying float vDepth;
varying vec2 vRoute;
${networkDepthGLSL}
void main() {
  float routeActive = 1.0-step(0.25,abs(vRoute.y-uRouting.x));
  float packet = exp(-pow(vRoute.x-uRouting.y,2.0)*600.0)*routeActive;
  float alpha = (0.10+packet*0.60)*networkPresence(uMorph)*mix(0.3,1.0,vDepth)*uIntensity*uQuiet;
  gl_FragColor = vec4(mix(vColor,vec3(1.0,0.88,0.7),packet*0.45),alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
