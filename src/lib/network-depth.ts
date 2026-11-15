/** A small virtual lens preserves the shared orthographic canvas and PC viewport. */
export const networkDepthGLSL = /* glsl */ `
vec3 networkProjection(vec3 p, float morph) {
  float formation = smoothstep(1.82, 2.0, morph);
  float strength = mix(0.25, 1.0, smoothstep(0.15, 0.8, morph)) * (1.0 - formation);
  float lens = 7.5 / max(4.5, 7.5 - p.z * 0.72);
  p.xy *= mix(1.0, lens, strength);
  return p;
}
float networkDepth(vec3 p) {
  return smoothstep(-2.8, 2.8, p.z);
}
float networkPresence(float morph) {
  return smoothstep(0.22, 0.72, morph) * (1.0 - smoothstep(1.65, 1.82, morph));
}
`;
