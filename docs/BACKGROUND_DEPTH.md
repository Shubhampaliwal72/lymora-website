# Background depth and meaningful network traffic

The approved centered opening, original artwork, wording, cards, navigation,
Downloads flow and static export are retained. No dependencies or deployment
configuration are added. The abstract network is decorative, not live LAN data.

## Research and decisions

- Three.js PointsMaterial: https://github.com/mrdoob/three.js/blob/dev/docs/pages/PointsMaterial.html.md
  Automatic size attenuation is a perspective-camera feature. The shared
  orthographic viewport keeps the PC preview stable, so the custom shaders use
  one small virtual-lens function instead of replacing the shared camera.
- Three.js fog: https://threejs.org/manual/pages/fog.html
  Distance attenuation separates near/far layers. The particle shaders apply
  depth-dependent size, brightness and point sharpness, not a fullscreen blur.
- Three.js Material: https://threejs.org/docs/pages/Material.html
  Transparent surfaces retain depthWrite=false. The two existing double-sided
  halo surfaces are preserved; a single line-segment pass adds the network.
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
  Native scroll and the existing smoothed progress remain the shared clock.
  A settled orb interval between morph values .88 and 1.2 makes the volume
  readable before the spiral opens. Reversing scroll retraces the morph.
- GSAP SplitText: https://gsap.com/docs/v3/Plugins/SplitText/
  Retain selective accessible landmark reveals and unsplit reading copy. No
  extra flying text or paragraph effects compete with the deeper background.

## Structure and ownership

network-depth.ts holds one GLSL projection/depth recipe used by points, routed
endpoints and halo surfaces. particle-field.ts preserves the original ring and
seed arrays byte-for-byte; the orb adds ordered surface strands plus an interior
population. Galaxy arms retain their pattern with more vertical separation.

particle-network.ts attaches fourteen nodes to actual particles. A minimum
spanning tree plus short neighboring links produces fifteen edges. A continuous
bidirectional graph walk sends one packet at a time; the source glows on dispatch
and the destination on arrival. Connected endpoints share the point vertex
shader, so breathing, pointer response and scroll morphs never detach the wires.
Routes disappear before the original logo silhouette forms.

ParticleCanvas owns one sparse line layer inside the existing viewport canvas.
Uniforms are shared with the points and halos. render-particle-frame.ts updates
the packet phase imperatively; no React state changes per frame. Existing native
visibility, saved Play/Pause, reduced motion, context-loss and mobile SVG behavior
are preserved. Float32 buffers are reused instead of copied into another field.
The original 24,200-particle budget, capped DPR and rendering clock are unchanged.

## Tuning and verification

- network-depth.ts: virtual lens strength and network visibility interval.
- particle-shaders.ts: depth attenuation, point sizes and packet/node highlights.
- particle-field.ts: orb strands/interior and galaxy depth.
- render-particle-frame.ts: packet cycle speed and endpoint holds.
- particle-network.ts: node count and sparse neighbor graph.

`node scripts/verify-particle-structure.mjs` checks the original ring/seed hashes,
finite volumetric targets, exact endpoints, sparse topology and a continuous,
deterministic route through every edge. `npm run verify:particles` tests real GPU
compilation, moving pixels, 14 attached nodes, scrolling/reversal, both palettes,
Downloads, browser history, explicit Play, pause and WebGL fallback. The local
`particles-depth-study.png` hides content only for technical inspection; the
homepage/orb/galaxy PNGs show the actual UI. Software WebGL tests are not a
hardware frame-rate benchmark.

Motion preferences belong to each origin. A local development address and a
Cloudflare address can have different saved Play/Pause choices even with identical
branch commits. This quality pass does not bypass the device default or change
production settings.

Verification completed: lint, typecheck, production build, static-export checks,
structure checks, particle browser checks and immersive browser checks passed.
The final export has 115 assets and 744 checked local references. The immersive
checks include 320/375/768px, short desktop, 1920px and 3840px layouts, both themes,
reverse morph, original PC interactions, history/Downloads, reduced motion,
explicit Play and GPU loss. No shader/runtime/hydration errors occurred after the
shader correction. Deliberately forcing GPU loss can emit the test-only
WEBGL_lose_context extension warning. The depth-study capture is inspection-only;
immersive-hero-dark.png and immersive-depth-galaxy.png are actual website views.
