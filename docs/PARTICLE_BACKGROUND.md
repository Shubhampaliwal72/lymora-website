# Centered particle background

The current visual direction replaces the old perimeter wallpaper with a continuously breathing orange/blue particle field. Normal document scrolling morphs a toroidal ring into an orb, then a three-arm spiral galaxy. Scrolling upward reverses the same morph. This is decorative artwork, not a claim of AI functionality.

## Shared implementation

- ParticleBackdrop wraps the existing site shell through the root layout. SVG content is available immediately, without WebGL or JavaScript initialization.
- ParticleCanvas uses one viewport-sized React Three Fiber canvas. The existing three-PC HeroWorld is composited into its original screen rectangle using a portal and scissor viewport. Its screenshots, delivery paths, controls and labels are preserved.
- Geometry contains 24,200 deterministic particles, rendered as one GPU points object. Vertex shaders handle continuous breathing and shape interpolation. There are no per-frame React state updates or postprocessing dependencies.
- GSAP owns the scroll morph and a capped 30 Hz rendering ticker. Pointer depth uses small eased offsets. Hero rendering retains its existing visibility/viewport controls. A shared Pause ambience control pauses the background independently of the product demo.
- Mobile, data-saving connections and lower capability devices skip the WebGL scene and use a lightweight SVG composition. Reduced motion makes both the particle scene and hero static. GPU initialization failure or context loss reveals the SVG composition and original product illustration.

## Tune appearance

- src/lib/particle-field.ts: deterministic ring/orb/galaxy targets and per-route intensity. Homepage is strongest; Downloads, documentation and privacy are quieter.
- src/components/animations/ParticleCanvas.tsx: shader ripple, point size, palette interpolation and particle count.
- src/components/animations/render-particle-frame.ts: centering, viewport scale, gentle depth and hero compositing.
- src/styles/particles.css: semantic blue accent, copper haze, reading veil, mobile fallback and reduced-motion rules. Existing orange/glossy tokens remain authoritative.

## Verification

Run lint, typecheck, build, verify:export, and verify:particles. Browser checks use the actual static output, local Edge and software WebGL. Screenshots and reports remain ignored in .verification. These checks establish rendering and behavior, not a hardware FPS benchmark. No desktop app files, release links, DNS or deployment configuration are changed.

## Real-device motion preference fix

The development browser on the owner's PC reports prefers-reduced-motion: reduce. Earlier captures forced no-preference, so they used the live GPU scene while the real browser displayed a static, sparse 1,100-point preview. That discrepancy was reproduced against the existing development server with its native media preferences.

The shared scene preference now follows a saved website choice (full/reduced) before the device default. The existing bottom-left control always remains available: Play animations explicitly opts into the live scene; Pause animations returns to a static composition. The choice persists per website origin and is independent of Windows settings. A fresh visitor who requests reduced motion still receives the static composition until choosing Play. Navigation arrival and anchor scrolling continue to honor device preferences separately.

The static/mobile preview now samples the same 24,200-particle field into approximately 8,000 points, batched into three SVG paths. Its desktop scale matches the WebGL geometry; the sparse five-ring fallback is gone. Both modes use the resolved site choice for CSS, so an explicit Play is not canceled by an unconditional OS media rule.

verify:particles now starts with the actual device preference before any media emulation, exercises explicit Play, compares changing background pixels, and verifies persistence after reload. Run it against Next development too using LYMORA_TEST_URL=http://127.0.0.1:3100. Browser profiles and captures remain local and ignored.
