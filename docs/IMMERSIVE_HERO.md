# Lymora immersive homepage — plan and implementation

The owner reverted the small comet sequence and requested a researched new
composition, followed by implementation. That direct request authorizes this
plan and replaces the old asymmetrical hero direction. No deployment or commit.

## Findings and direction

The current homepage puts a left-aligned headline, three PCs and a particle ring
in the same opening. The backdrop is scaled to 0.72 and composed at 70% width;
it reads as an illustration beside the product rather than the page environment.
The owner wants the visual to be large, centered and alive before scrolling.

Creative concept: a living signal halo. Large intertwined copper/blue translucent
surfaces and particles frame real HTML copy. The opening establishes the brand;
the next section demonstrates the actual LAN product with the existing three PCs.
Existing screenshot tabs, chapters, setup story and download flow follow intact.

Research references (principles, not copied assets/layouts):
- https://lusion.co/ — 3D visual storytelling and interactive brand experiences.
- https://threejs.org/manual/pages/responsive.html — CSS sizing and matching the
  camera to its real display aspect; avoid stretching geometry across screens.
- https://r3f.docs.pmnd.rs/advanced/scaling-performance — shared geometry, demand
  rendering and explicit invalidation when animating.
- https://r3f.docs.pmnd.rs/advanced/pitfalls — mutate fast state in the frame loop,
  not React state; reuse and dispose materials/geometry.
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/ — scoped scrubbed transitions.

## Composition and motion

1. A centered, near-viewport-height hero. Existing heading, actual product copy
   and actions remain readable immediately. No desktop devices compete here.
2. A large halo around the copy: approximately 80–90% viewport-height diameter,
   widened subtly into an orbital form. It remains centered on ultrawide screens;
   portrait/mobile compositions scale to width. Camera aspect is never distorted.
3. Two genuinely triangulated translucent ribbons provide reflected highlights,
   depth and moving edges; the existing particles provide finer connective detail.
   Continuous gentle breathing and pointer depth are separate from scroll morph.
4. Native scrolling carries the scene into the next chapter, where the existing
   PC preview demonstrates real message/file paths. Later sections remain quiet
   and readable with the established heading/paragraph reveals.
5. Shared primary buttons: rounded glass, orange text, thin copper border,
   anticlockwise border beam, shallow hover/press depth, visible focus. Existing
   link destinations and disabled controls remain unchanged.

## Scope, ownership and safeguards

Existing Next.js 16.4.5 / React 19.3 / R3F 9.8.2 / Three 0.187 / GSAP 3.15.1 /
Motion 14.10.1 / npm. Reuse them; no added packages or deployment changes.

LivingHero and a separate NetworkPreview own HTML layout. particle-composition
owns measured placement. The existing viewport renderer owns the particle and
ribbon geometry plus the offscreen-paused PC portal. GSAP owns scene time and
scroll; Motion retains UI interactions. Shared CSS owns button surfaces/edges.

One WebGL context, existing 24,200-particle budget, capped DPR and 30 Hz ambient
updates. Hidden tabs pause. Mobile/data saver/low-capability devices use the SVG
fallback. Reduced motion is static unless the visitor explicitly selects Play.
Copy, original artwork, keyboard navigation and Downloads work without WebGL.
No desktop application files, claims, release links or DNS changes.

## Validation

Lint, typecheck, build and verify:export. Actual local static-export browser
captures: desktop 1440/1920, short viewport, mobile 320/375/768, ultrawide 3840;
centering, halo scale, live pixels, reverse scrolling, relocated PC interactions,
all section links, glass controls, both themes, reduced motion, history and GPU
fallback. Retain shared navigation/glass checks. Local images remain ignored in
.verification. Browser software WebGL does not establish hardware frame rates.
