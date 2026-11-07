# Living Network: Stage 1 checkpoint

Date: 2026-11-07, Asia/Calcutta. Approved A+B direction with C's restrained
Porcelain materials. Stage 1 covers the design system/layout and initial cinematic
hero. It does not claim the six-scene scroll story or completed product gallery.
No desktop application files changed. No commit, push, release, DNS or deployment.

Preview: http://127.0.0.1:3100. The existing development server was reused.

## What is working

- Real R3F/Three.js computer meshes, rounded cases, stands, status LEDs, direct
  path geometry, one finite message signal, subtle camera depth and pointer rig.
- A real, unmodified Lymora renderer capture on the foreground display. Other
  displays use the original app mark; no generated or reconstructed application UI.
- Ember Night and Warm Porcelain materials, semantic CSS colours and local fonts.
- Finite 4.5-second clock with Pause, Play and Replay. No perpetual network loop.
- On-demand WebGL rendering, deferred import and release on Lighter view.
- 2.5D composition on mobile/tablet/coarse-pointer, reduced motion, Save-Data,
  slow-2G/2G or devices reporting fewer than four cores/4 GB. Missing device hints
  are not treated as proof that a device is weak; viewport/pointer/motion checks
  still apply. Quality thresholds are conservative heuristics, not benchmarks.
- Visibility/intersection pause, context-loss fallback and no-JavaScript content.
- The old static diagram and generic feature-card row are replaced by the spatial
  hero and a short editorial connection explanation. Existing navigation anchors
  and honest release-status destination remain functional.

## Components and changed files

| File | Purpose |
| --- | --- |
| src/components/living-network/LivingHero.tsx | Server-rendered headline, product copy, actions and scene placement. Reuses HeroMotion and icons. |
| src/components/living-network/LivingNetwork.tsx | Small interactive boundary, finite GSAP clock, pause/replay state, lazy Canvas, visibility handling, error boundary and lighter-view control. |
| src/components/living-network/NetworkCanvas.tsx | R3F-only rendering: computer geometry/materials, original image textures, camera/pointer transform and direct path/signal. Own resources are disposed; the loader's source images stay in its bounded asset cache. |
| src/components/living-network/NetworkFallback.tsx | SSR-visible 2.5D computer composition with CSS-selected original images. A finite CSS signal enhances normal-motion lightweight views. |
| src/components/living-network/useScenePreferences.ts | Hydration-safe external-store subscriptions to theme, reduced motion, pointer/viewport, optional hardware/network hints and page visibility. No module-level browser access. |
| src/components/living-network/scene.ts | Shared clock/pointer types, intro duration and central theme-specific 3D material palette. |
| src/app/globals.css | Cinematic composition, responsive header/hero, local scene glow, fallback geometry, controls and accessible reduced-motion defaults. Removes unused old-diagram styles. |
| src/styles/tokens.css | Adds semantic scene/material/background-image tokens. CSS selects one screenshot/mark theme so the mobile fallback does not fetch both versions. |
| src/app/page.tsx | Composes the new hero and editorial connection/download destinations; no new runtime routes. |
| src/app/layout.tsx | Updates the title to Nearby. Connected.; local fonts/pre-paint theme/noindex stay. |
| src/components/site/SiteHeader.tsx | Adjusts navigation wording for the experience while reusing original logos/menu/theme controls. |
| src/components/site/Icons.tsx | Adds the small Pause and Play icons used by accessible scene controls. |
| src/components/sections/Hero.tsx, LanScene.tsx | Removed superseded hero/diagram implementations after replacing their import. HeroMotion remains reused. |
| public/brand/mark-dark.png, mark-light.png | Byte-for-byte original brand exports copied from the desktop source; original logos remain unchanged. |
| public/media/living-network/ | Two byte-for-byte original demo chat captures plus publication warning. No error-toast/gallery screenshots copied. |
| docs/LIVING_NETWORK_ASSETS.json | Original capture paths, hashes and explicit local-preview/release-review status. |
| package.json / package-lock.json | Adds only the approved 3D dependencies and matching TS types, pinned exactly. Existing scripts/versions remain. |
| scripts/verify-browser.mjs | Checks real WebGL, deferred loading, 12 layouts/themes, animation/pause, input access and fallbacks against static export or localhost dev. Uses installed Edge with software WebGL in headless QA. |
| eslint.config.mjs | Excludes ignored local .verification output from source linting; does not suppress application rules. |
| AGENTS.md, README.md, HERO_IMPLEMENTATION.md, design/living-network/PLAN.md | Records approval/current stage and keeps earlier verification clearly historical. |
| design/living-network/build-concepts.mjs | Removes unused arguments exposed by lint; no concept artwork or source asset changed by this cleanup. |
| docs/LIVING_NETWORK_STAGE1.md | This explanation and verification record. |

## Why the animation tools do not conflict

GSAP owns only the intro progress object and the separate hero-copy reveal.
R3F reads that object and owns its camera, objects, path and signal transforms.
Pointer depth affects a separate R3F rig. Motion controls only independent DOM
buttons and the menu. CSS controls colours and the fallback's dedicated signal.
There is no GSAP/Motion/Three transform competition on one object or DOM node.

The root scene starts as real SSR-visible 2.5D content. Eligible desktops load the
3D module after initial paint. Mobile, reduced-motion and conservative low-power
paths never mount that module. The headless production check explicitly confirmed
no request for the lazy renderer chunk on initial mobile/reduced-motion loads.

The canvas uses frameloop=demand. Only active clock updates or pointer settling
request renders. The intro pauses when hidden/offscreen. The lighter view releases
the Canvas; WebGL context loss falls back without a reload/retry loop. Theme
switching keeps the matching fallback visible until its new textures render.

## Verification results

All final checks passed:

- npm run lint: exit 0, zero warnings. No application lint rules disabled.
- npm run typecheck: exit 0; final next build also completed TypeScript checking.
- npm run build: exit 0, homepage/not-found prerendered, static out/ intact.
- npm run verify:browser: exit 0 against production export.
- LYMORA_TEST_URL=http://127.0.0.1:3100 npm run verify:browser: exit 0 in dev/Strict Mode.
- npm audit --omit=dev --json: zero production vulnerabilities.

Browser: Edge 156.0.4314.50. Both runs covered 320, 375, 390, 768, 1024 and 1440px
in dark/light, with no horizontal overflow. Desktop actually rendered WebGL;
mobile/tablet stayed in 2.5D. Keyboard menu/Enter, Escape focus, touch navigation,
anchors, persisted theme choice, visibly changing animation, stable paused frames,
finite replay, live reduced-motion changes, low-power hints, lighter-view release,
WebGL context loss and no-JS content/menu/fallback all passed. No missing assets,
external page requests, hydration errors or console/runtime errors were observed.

Local results/screenshots are ignored under .verification/: browser-results.json,
development-results.json, desktop-dark.png, desktop-light.png, mobile-dark.png,
mobile-light.png and corresponding full-page captures. Both desktop themes and
the mobile fallback were visually reviewed; labels/paths were adjusted to stay
clear of app imagery. Initial test/lint failures were corrected before these
final passes: a camera mutation lint pattern, stale fallback component reference,
and a too-conservative device-memory threshold in the headless browser.

The lazy renderer chunk is 928,661 bytes raw / 244,716 bytes gzip. It is not fetched
on the initial mobile/reduced-motion paths. This is an emitted-file measurement,
not a complete measured cold-network transfer budget. Initial modern-browser
script tags total about 226 KB gzip, excluding the legacy nomodule polyfill.
The production local run observed LCP 148-712ms and max CLS about 0.0028 in its
sampled layouts. These are unthrottled loopback/headless software-renderer results,
not field Core Web Vitals or a hardware/GPU frame-rate guarantee. INP and physical
hardware profiling remain Stage 5 work; one browser engine is covered here.

## Assets requiring owner input before public use

The hero's actual captures contain renderer-test names/messages and pending
message states. They are explicitly labelled test data in the local preview;
they are not clean release screenshots. Please provide/review current clean
Chats (including real delivered/read states), Groups, Files/progress/image preview
and Network screenshots before Stage 4/publication. The existing Network capture
has an error toast and the gallery capture has a missing-image/error state;
neither is presented by this implementation. Do not recolour screenshots or
manufacture new read/delivery UI states to fill these gaps.

No old 25 MiB limit or unlimited-transfer guarantee was introduced. Current
attachment validation/storage and actual group-delivery semantics were rechecked
read-only in desktop source. There are no calling/video/security-marketing claims.
The public Windows installer URL and release metadata are still unavailable;
the download action leads to a clear release-status section, not a fake URL.

## Remaining stages and limits

Stage 2: richer interactive endpoint selection, discovery/direct connection
choreography and message/file path sequencing.
Stage 3: GSAP ScrollTrigger six-scene journey and B's screen match-cut.
Stage 4: approved clean product captures, feature demonstrations and real release link.
Stage 5: physical mobile/GPU profiling, additional browser engines, throttled
network/CPU measurements, deeper accessibility and release performance checks.

The eight moderate development-toolchain audit findings/ESLint 9 deprecation
remain from setup. No forced dependency downgrade/upgrade was used to hide them.
Figma tool quota and the pending Canva support-art generation remain design-tool
limits; Stage 1 uses the owner's approved local A+B boards and original assets.
No diagram screenshot or flattened concept board is used as the live hero.
