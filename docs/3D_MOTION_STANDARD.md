# Lymora website: 3D and motion standard

This standard keeps the site cinematic while protecting readability, navigation,
and Cloudflare Pages static export. It applies to the existing website only.

## Visual language

- Use the existing copper-orange and restrained blue particle field as one shared
  environment. Depth comes from the existing 3D particle geometry, layered light,
  and measured movement; do not add a second full-screen renderer.
- Keep the original Lymora logo, desktop screenshots, copy, and product imagery.
  Show real product screens only; decorative scene work must not imply features.
- Keep the header a calm, fully rounded glass capsule with a quiet edge. Keep
  buttons legible and simple; use short press feedback without moving surrounding
  layout.
- Keep content over a subtle reading veil. The field can be visible around text,
  but text and controls remain the foreground.

## Motion ownership

- React Three Fiber and Three.js own the shared particle scene and shader depth.
- GSAP owns document-scroll choreography and measured particle placement.
- Motion owns small, independent React state transitions. CSS owns hover, focus,
  and material transitions.
- An element/property has one animation owner. Do not animate the same transform
  simultaneously from GSAP and Motion.
- Native scrolling stays in control. Scroll-linked scenes reverse naturally when
  the reader scrolls upward; no forced scroll, pinned chapters, or delayed copy.
- Frequent controls and tabs do not scale or move. Their state can change color,
  border, and opacity while their box geometry stays fixed.

## Performance and access

- Reuse the current renderer, particle budget, demand rendering, capped pixel
  ratio, visibility pause, and lightweight mobile fallback. Do not add an engine,
  post-processing chain, dependency, or continuously running React state loop.
- Make the full composition understandable with animation paused. Respect the
  site's explicit motion choice and system reduced-motion default; static content
  must remain visible and keyboard-operable.
- Prefer `transform` and `opacity` for motion. Avoid animated layout dimensions,
  broad blur animation, hover-only actions, and persistent `will-change` hints.
- Keep touch scrolling native, remove tap-highlight flashes only where custom
  feedback replaces them, and test the site on a physical phone before claiming
  mobile acceptance.

## Release checks

Verify the actual production export at 320, 375, 768, 1024, 1440, and ultrawide
widths; dark and light themes; keyboard tab navigation; rapid tab switching;
upward and downward scrolling; paused and reduced-motion modes; and WebGL failure.
Check that tabs do not resize on click, no copy is clipped, and the full scene
stays behind the real page content. Browser emulation does not establish mobile
GPU frame rate or physical-device behavior.
