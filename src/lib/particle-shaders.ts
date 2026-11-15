/* GPU deformation stays within the existing shared renderer and particle budget. */
export const particleVertex = /* glsl */ `
attribute vec3 aOrb;
attribute vec3 aGalaxy;
attribute vec3 aLogo;
attribute vec3 aSeed;
uniform float uTime;
uniform float uMorph;
uniform float uDpr;
uniform float uLogoReady;
uniform float uHalo;
uniform vec2 uPointer;
uniform float uInteraction;
uniform vec3 uWarm;
uniform vec3 uCool;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float angle = aSeed.z * 6.2831853;
  vec3 ring = position;
  float ripple = sin(angle * 7.0 + uTime * 0.53) * 0.045
    + cos(angle * 4.0 - uTime * 0.31 + aSeed.x * 4.0) * 0.025;
  ring.xy *= 1.0 + ripple;
  ring.z += sin(angle * 5.0 + uTime * 0.37) * 0.12;
  vec3 orb = aOrb * (1.0 + 0.045 * sin(aOrb.y * 3.0 + uTime * 0.6 + aSeed.x));
  vec3 galaxy = aGalaxy;
  float spin = uTime * 0.035;
  galaxy.xy = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * galaxy.xy;
  vec3 p = mix(ring, orb, smoothstep(0.0, 1.0, uMorph));
  p = mix(p, galaxy, smoothstep(1.0, 1.8, uMorph));
  float formation = smoothstep(1.82, 2.0, uMorph) * uLogoReady;
  p.x *= 1.0 + uHalo*0.12*(1.0-formation);
  p = mix(p, aLogo, formation);
  // A small subset drifts near the pointer; the main field bends gently around it.
  vec2 delta = p.xy - uPointer;
  float influence = exp(-dot(delta, delta) * 1.8) * uInteraction * (1.0 - formation);
  p.xy += normalize(delta + vec2(0.001)) * influence * 0.14;
  p.z += influence * (0.24 + sin(angle * 5.0 + uTime) * 0.12);
  float mist = smoothstep(0.984, 0.992, aSeed.y) * uInteraction * (1.0 - formation);
  vec3 wisp = vec3(uPointer + vec2(cos(angle + uTime * 0.24), sin(angle * 2.0 - uTime * 0.19))
    * (0.11 + aSeed.x * 0.25), sin(angle * 3.0 + uTime * 0.4) * 0.23);
  p = mix(p, wisp, mist);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.3 + aSeed.x * 1.8 + influence * 0.3) * uDpr;
  float palette = mix(smoothstep(-0.8, 0.8, p.y), 0.9, formation);
  vColor = mix(uCool, uWarm, palette);
  vColor = mix(vColor, vec3(1.0), pow(aSeed.y, 16.0) * 0.3 + influence * 0.12);
  vAlpha = 0.22 + aSeed.y * 0.6;
}
`;
export const particleFragment = /* glsl */ `
uniform float uIntensity;
uniform float uQuiet;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float r = dot(p, p);
  if (r > 0.25) discard;
  float light = exp(-r * 20.0) + exp(-r * 8.0) * 0.35;
  gl_FragColor = vec4(vColor, light * vAlpha * uIntensity * uQuiet);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
