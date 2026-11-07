# Living Network: Stage 2 checkpoint

Date: 2026-11-07, Asia/Calcutta. Independent website workspace only.
Stage 1 was reviewed and committed on dev as
72a93bfbb71a83e88a189921bccf7028429d8b71:
feat: implement Lymora Living Network stage 1.
Generated concept SVG/PNG previews and test profiles were excluded. The staged
path/credential-pattern review and git diff --cached --check passed. Nothing
was pushed, deployed, released or merged to main.

## Result

The approved A+B hero now lets visitors choose Studio PC or Team PC, then send
an illustrated message or file along its direct route. A finite six-second
sequence shows discovery, connection, transit, arrival and a small return signal.
The selected monitor rises slightly, its case is pointer-selectable, and the
camera moves only a small distance toward the endpoint. No orbit controls,
cloud hub, decorative particle field or simulated app chat UI was added.

The scene is an explanation, not a browser LAN scan or measured transmission.
The real app image remains an unretouched renderer capture. Match-cut into the
receiving app and six-chapter scroll storytelling remain Stage 3 work.

## Implementation map

| File | Responsibility |
| --- | --- |
| src/components/living-network/scene.ts | Shared endpoint/device coordinates, 3D and SVG route control points, bounded phase/travel calculations and six-second duration. Contains no Three imports, preserving the lightweight bundle boundary. |
| src/components/living-network/LivingNetwork.tsx | Accessible receiving-computer and message/file buttons, finite GSAP clock, semantic status updates, replay, pause, visibility/intersection gating and existing lazy/fallback controls. React status changes occur only on phase boundaries. |
| src/components/living-network/NetworkCanvas.tsx | Pointer selection on real meshes, selected-device lift, direct path construction, message/file geometry, small return signal, discovery sweep and bounded camera framing. Own geometries/textures/listeners are disposed. Keeps on-demand rendering and DPR cap. |
| src/components/living-network/NetworkFallback.tsx | Uses the same progress/route model for SVG packet motion. DOM drawing updates occur outside React on the shared clock; no second CSS animation timer can drift out of sync with Pause. |
| src/components/site/Icons.tsx | Two small interface icons for Message and File; original logo artwork is unchanged. |
| src/app/globals.css | Responsive choices/status strip, visible selection/focus states and restrained path styling. Removes the obsolete independent signal keyframe animation. |
| src/styles/tokens.css | Points the original theme-specific screenshot tokens to the sanitized Chats captures. |
| public/media/product/ | Eight original renderer client-area PNGs and an explicit fictional-fixture provenance note. Old pending/test-wording public captures are removed. Only Chats is currently fetched by the hero; other views are prepared for later product storytelling. |
| docs/LIVING_NETWORK_ASSETS.json | Hash, view, theme, fictional-address and publication-review status for every retained capture. |
| docs/LIVING_NETWORK_ASSET_AUDIT.md | Reusable source inventory, isolated read-only capture method, rejected material and precise remaining needs. |
| scripts/verify-scene.mjs | Exercises actual shared phase/curve code: boundaries, both endpoints, finite coordinates and settled final state. |
| scripts/verify-browser.mjs | Adds ordered phases, endpoint keyboard/3D selection, message/file replay, touch controls, shared pause and immediate reduced-motion outcome checks to the existing browser regressions. |
| README.md, AGENTS.md, design/living-network/PLAN.md | Updates the current stage, local commands and review boundaries. Earlier checkpoint documentation remains historical. |

No runtime dependencies were added in Stage 2. The website imports no desktop
application code at runtime. Desktop source is used only for read-only inspection
and isolated development captures.

## Motion, access and performance

GSAP writes one plain progress object. Three/R3F owns all 3D transforms; the SVG
fallback interprets the same object through its own drawing callback. Motion owns
independent DOM button presses. No libraries compete over the same transform.

Native buttons mirror the 3D pointer interaction for keyboard/touch users. Selected
states use aria-pressed and results use a polite, atomic status region. Controls
remain usable when reduced motion is enabled; its result is immediate with no
WebGL. No-JavaScript visitors retain readable content and the static composition.
Pause/replay remain explicit; no animation loops perpetually. Hidden/offscreen
work pauses. Lighter view and context loss release the Canvas. Existing viewport,
pointer, Save-Data, network and hardware heuristics still gate the deferred 3D
module. This does not guarantee hardware performance on every device.

## Verification

Passed on the final runtime source:

- npm run lint: zero warnings.
- npm run typecheck: exit 0.
- npm run build: exit 0, static export intact.
- node scripts/verify-scene.mjs: all phase/route assertions passed.
- npm run verify:browser: production export passed all 12 width/theme layouts,
  direct 3D monitor clicking, real desktop WebGL, deferred-renderer exclusion on initial mobile/reduced-motion,
  keyboard/touch controls, ordered stages, message/file arrival, pause/replay,
  lightweight/reduced-motion/low-power/context-loss/no-JS regressions, local
  assets, anchors, theme persistence and console/hydration checks.
- Isolated actual desktop renderer capture: final run passed with no console
  errors, alerts or broken images. Eight suitable images reviewed in both themes.
- Development functional browser sweep reached the final console check; it caught
  a reduced-motion hydration warning on new Motion buttons. Explicit tabIndex=0
  keeps server/client attributes consistent; the warning was not suppressed.
  A focused final development rerun passed all four theme/motion combinations
  with no hydration/console/runtime errors. Direct 3D clicks passed in the sweep.

The first development check could not load because the old development server
had exited. The preview was restarted with npm run dev on 127.0.0.1:3100; no other
process was terminated or configuration changed to hide the failure.

Production deferred 3D chunk: 930727 bytes raw / 245305 bytes gzip, about 0.6 KB
gzip larger than Stage 1. The twelve local production samples observed LCP
164-324 ms and maximum CLS about 0.0093. These are loopback/headless Edge
software-renderer observations, not field metrics or physical-GPU measurements.
Additional engines, real mobile hardware and throttled performance remain Stage 5.
The prior development-toolchain audit findings remain; dependencies are unchanged.
R3F also emits an upstream Three.Clock deprecation warning in development with
this Three release. It does not cause a test/runtime failure; dependency internals
were not patched or warnings hidden.

## Review boundary

Stage 2 is kept uncommitted for owner review. Stage 3 scroll/match-cut and Stage 4
full product gallery/release download are not claimed complete. No public release
URL is invented, no obsolete 25 MiB limit is restored, no group read receipt is
inferred from delivery counts, and no calling or security marketing is invented.
The desktop application's code, backend, database, settings and history remain
untouched. Website publication remains unapproved.
