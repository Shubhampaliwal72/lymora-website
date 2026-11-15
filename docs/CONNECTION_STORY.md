# Chapter 02: people behind the local connection

The chapter keeps the existing three setup steps and the independent PC/network/PC strip. On a capable desktop (at least 1000px wide and 720px tall), a bounded scroll story holds the composition below the public header. Native scrolling advances or reverses the same progress value for text, human point geometry, discovery links and the message packet. The reader can also choose a step with native keyboard-operable buttons, or use the link to continue to chapter 03. This exit uses the existing Next.js NavigationLink wrapper, so its hash navigation preserves the router state needed when returning from another route.

## Research and decisions

- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) documents scrubbed timelines, pin spacing and refresh. A local pin with automatic spacing keeps the chapter readable without intercepting wheel or touch input. Font readiness refreshes measurements. Step-button scrolling independently honors the OS navigation motion preference, even when brand animation is explicitly enabled. There is no scroll snapping or global scroll lock.
- [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) collects animations and restores layout when the viewport no longer matches. It is scoped inside the existing useGSAP lifecycle, so pause, resize and route unmount release the stage.
- [Three.js BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html) describes point geometry and batching. This small illustration uses the same principle with CPU-projected 3D points batched into six SVG paths. The existing shared WebGL renderer remains the only canvas. No model download, new library, per-frame React state or permanent animation loop is added.

The original human silhouettes have a head, neck, torso, relaxed arms and legs, with sparse anatomical links. They illustrate the people behind two local PCs; they do not imply human tracking, an AI service or live network monitoring. A sparse central node cloud represents the LAN. Discovery progressively draws the route; the send phase advances one packet along the actual quadratic connection curve. Body depth and perspective respond to scroll, then hold when scrolling stops.

## Ownership and tuning

- ConnectionStory.tsx owns one chapter-only timeline, text transitions and accessible step selection. Reading holds occur around progress .12, .50 and .90. Pin distance is 1.8 viewport heights; scrub catch-up is .35 seconds.
- ConnectionNetwork.tsx owns the static SVG and its batched imperative updates.
- lib/connection-network.ts owns deterministic anatomical point surfaces, perspective projection, discovery and exact curve sampling. No artwork or logo is replaced.
- styles/connection-story.css supplies scoped layout, theme-token colors, a local soft readability scrim and responsive fallbacks. Imported directly in the root layout so development CSS tracking stays reliable.

Mobile, shorter viewports, low-capability devices, paused animation and reduced motion show all original steps in normal flow plus the complete static diagram. The SVG is present in server HTML and remains available without WebGL or JavaScript. The decorative scene is excluded from keyboard and accessibility interaction; the original setup copy remains HTML. Header, hero, Downloads URLs and deployment settings are preserved.

## Verification

Run npm run lint, npm run typecheck, npm run build, npm run verify:export and node scripts/verify-network-motion.mjs --connection-only. The focused browser verifier checks both palettes, forward/reverse reading holds, real projected geometry changes, packet visibility, keyboard activation, native exit, pause/resume cleanup, client navigation/Back, mobile widths, reduced motion and server-rendered no-JavaScript content. Existing premium UI checks retain their original route-strip assertions and use the step picker for the enhanced story.

Browser captures use the actual local static export with software WebGL; they are not a physical-device FPS benchmark. No commit, push or deployment is included.

## Measured results

Verified against the final static export: lint, typecheck, production build and verify:export passed. The focused connection-story browser checks passed in both palettes, including forward/reverse holds, changing perspective, keyboard step selection, route/Back cleanup, pause/resume, mobile widths and reduced/no-JavaScript fallbacks. The existing full motion and launch suite passed, including 320?3840px containment, all seven secondary routes, preserved PC preview controls and download verification. Both browser runs reported no warnings, runtime errors or missing assets. Export checks covered eight routes and 745 local references; the largest JavaScript asset remains 922,308 bytes. No new dependency or renderer was introduced.
