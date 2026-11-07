# Lymora Living Network: concept approval package

Prepared 2026-11-07, Asia/Calcutta. A+B is now approved, with C materials for the light theme. This document is the approved design contract. Stage 1 is committed as 72a93bf; Stage 2 interactive connections are implemented. See ../../docs/LIVING_NETWORK_STAGE2.md and ../../docs/LIVING_NETWORK_ASSET_AUDIT.md. At the original concept checkpoint application code was unchanged; implementation verification is tracked separately. Nothing has been deployed.

Open review.html for the visual concepts and six-scene board. Every concept has
Ember Night and Warm Porcelain versions. The SVGs contain editable vector geometry
and text plus unmodified original logos and actual app captures. Previews are
review images, not implementation assets or a finished 3D scene.

## Delivery status

- Three distinct hero directions: prepared locally, in both themes.
- Six-scene visual storyboard: prepared locally, plus individual importable SVGs.
- Native Figma storyboard: BLOCKED by the connected account's Starter MCP quota.
  The actual tool returned its quota error before any canvas read or mutation.
  A session was created, but no new Figma concept nodes or frames were created.
  Existing file: https://www.figma.com/design/0nOAeu9ClPbL5Zrc4iIkeX
  Session: 511f8ec3-78c2-4d71-ac0b-90e8ef540cda.
  Individual SVGs can be imported manually, but native editable Figma text,
  auto-layout, variables and component bindings still need construction and
  validation when tool access becomes available. Do not claim that an import is
  already a completed native Figma design.
- Canva: original design DAHZLH1-kOA inspected. The on-brand generation widget is
  prepared with that exact visual reference and a supporting landscape brand
  composition brief. No new Canva asset has been generated/exported yet: the
  widget requires the owner's selection/start action. No original design edited.
- Homepage implementation: A+B approved. Stages 1-2 hero/layout and interactive connections are implemented; Stages 3-5 remain.

## Creative premise

The network is the product story, not decoration behind a generic landing page.
Three physical Windows PCs exist in the same space. One discovery sweep reveals
them. A direct connection becomes a path. A message travels, then the receiving
monitor becomes the real application interface. A third PC joins the group.
A file follows the same physical connection. The final camera move settles into
large, flat, readable screenshots and a verified Windows release destination.

No central cloud/server object. No random particle field, floating feature cards,
voice/video buttons, invented app screens, fake customers, or implied benchmark.
Orange marks useful activity; surfaces and typography carry the rest.

## Three original hero directions

### A. Ember Constellation (recommended foundation)

Files: 01-ember-constellation-dark.svg and -light.svg.

Composition: an asymmetrical cinematic stage, substantial typography on the left,
three grounded computer forms in layered depth across the right. The closest
monitor carries the actual Lymora chat capture. A low orange horizon and thin
paths connect equal peers; the light does not outline every surface.

Headline: Nearby. Connected.
Accent line: No internet required.
Subline: A conversation begins nearby. Watch it move, directly from PC to PC.

Interaction: choose a PC with an accessible DOM button or pointer selection.
The selected device becomes the receiving endpoint; the scene moves to it.
A very small pointer-depth rig adds spatial presence on fine-pointer desktops.

Narrative advantage: supports all six chapters without replacing the scene.
Risk: theatrical depth can shrink real UI; counter with B's screen match-cut.

### B. Follow the Message

Files: 02-follow-the-message-dark.svg and -light.svg.

Composition: centered editorial headline, two physical PCs, and a single luminous
message route crossing the composition. The receiving display is much larger.
The object the visitor follows is a message, not an abstract orbit.

Headline: Follow the conversation.
Subline: One message. Two nearby PCs. A direct connection.

Interaction: Replay message or select a chapter. A bounded camera dolly follows
the message into the destination monitor; a match-cut removes perspective and
reveals a full-resolution real screenshot or real recorded state sequence.

Narrative advantage: explains the value with a clear cause and effect; the
strongest transition from impressive motion to understandable product.
Risk: continuous macro movement can be uncomfortable. Use one short arrival,
then scroll or explicit controls; reduced motion shows both endpoints at rest.

### C. The Connected Table

Files: 03-connected-table-dark.svg and -light.svg.

Composition: a quiet architectural tabletop with an orthographic/isometric
arrangement of independent PCs. Fine lines describe a peer-to-peer network.
The actual group capture occupies a foreground screen. This direction is
especially expressive in Warm Porcelain without relying on black backgrounds.

Headline: Your people. One shared space.
Subline: A living map of nearby computers. Select a device. See the conversation.

Interaction: selecting a peer or chapter changes which direct paths are active.
A shallow elevation change brings that device forward; no spinning orbit controls.

Narrative advantage: approachable, precise and easier to adapt to small screens.
Risk: it can become a static diagram again. Maintain visible cause/effect:
select peer -> direct path -> moving message -> actual receiving UI.

### Recommended combination

Use A's scene/world and typography, B's deliberate camera match-cut into real UI,
and C's restrained porcelain materials for the light theme. These are complementary
techniques within one Living Network concept, not three unrelated sections.
Approve this combination, or choose one direction before implementation begins.

## Storyboard and exact sequencing

The six individual scene-01.svg ... scene-06.svg files and storyboard-overview.svg
show keyframes. These are spatial/storytelling intentions, not rendered animation.

| Scene | Normalized desktop story progress | Visual cause and effect | Product evidence |
| --- | --- | --- | --- |
| 01 Discover | 0.00-0.14 | Three independent PCs emerge in a wide composition; one short sweep identifies reachable peers. | Existing actual Network UI reference; needs a clean orange capture without the error toast. |
| 02 Connect | 0.14-0.29 | One direct path resolves between two selected PCs; modest camera dolly. | Source-verified direct PC-to-PC transport. No cloud object or false latency number. |
| 03 Converse | 0.29-0.48 | Signal arrives at the receiving display; match-cut to a flat real screenshot. | Direct chat supports SENDING, SENT, DELIVERED and READ. Dedicated real captured states are still required. |
| 04 Groups | 0.48-0.65 | Third PC joins, direct paths fan out; actual group screen becomes the focal view. | Actual group screenshot shows three members and 2/2 delivered. Group delivery is not proof all members read it. |
| 05 Share | 0.65-0.83 | One file marker follows a direct path and resolves to a real attachment card. | Actual group attachment exists. Capture upload/preparing/sending stages; do not invent remote percent/speed. |
| 06 Real app / Windows | 0.83-1.00 | Perspective settles; full-resolution screenshot gallery and Windows release destination remain still. | Real Chats, Groups, Files, Network captures; verified installer metadata/URL pending. |

Intro before scrolling: a finite, approximately 4.5-second sequence. PCs become
recognizable by ~0.5s; direct path by ~1.4s; message travel by ~2.4s; receiver UI
focus by ~3.6s; scene rests by ~4.5s. These are proposed design timings, not actual
network timings. Provide Pause and Replay; no perpetual particle/network loop.
Headline and CTA are usable from the first paint and are not delayed by WebGL.

Desktop progression uses native page scrolling. Start with one visual stage
spanning at most about three additional viewport heights, with six semantic DOM
chapters and direct chapter links. No scroll hijacking, forced snapping or wheel
interception. The user can skip the journey and reach screenshots/download.
The exact pin distance will be tested on real devices; shorten or remove it if
it creates dead scrolling. All content remains readable without pinning.

## Precise tool ownership

Recommended main scene: React Three Fiber + three.js, not Spline plus R3F together.

| Effect / property | Sole owner | Technical contract |
| --- | --- | --- |
| Scroll position -> normalized story progress | GSAP + ScrollTrigger | One scoped timeline writes a plain sceneState.progress reference. MatchMedia limits pinning to capable desktops; cleanup reverts only owned triggers/context. |
| Camera, device transforms, path geometry, material light | R3F / three.js | Render derives these values from story progress. No other engine writes these object transforms. |
| Message/file marker location and visibility | R3F / three.js | Position follows a curve using the shared story state. No claimed live network traffic. |
| Initial finite 4.5s sequence / Pause / Replay | GSAP timing state | Writes the shared progress input; scroll or explicit chapter selection cancels the intro before taking ownership. It never competes with the scroll timeline. |
| Fine-pointer response | R3F local pointer rig | Small local offset on a separate child rig, clamped to about 2 degrees. Story transforms stay on a parent. Disabled on touch/reduced motion. |
| UI menus, chapter tabs, screenshot selection, button feedback | Motion | Animate only independent DOM UI wrappers. No Motion transforms on the GSAP-managed stage or R3F objects. |
| Scene-to-readable-screenshot match-cut | GSAP DOM wrapper | R3F settles its own camera. GSAP reveals the separate flat screenshot wrapper; no image pixel replacement or fake app elements. |
| Theme colours / focus / simple hover | Semantic CSS | Preserve Ember Night and Warm Porcelain; static contrast and focus styles are independent of motion. |
| Visual composition / frame states / timing annotations | Figma | Native editable frames/components/variables after quota access; not a runtime animation engine. |
| Supporting brand composition / social image / fallback art direction | Canva | Original owner logo and restrained paths; no fabricated UI or replacement logo. Export only reviewed assets. |

R3F uses on-demand rendering when idle. GSAP onUpdate invalidates the canvas while
progress changes, and animation requests stop when at rest. Do not put frame-rate
animation values in React state. When hidden/offscreen, pause the intro and stop
requesting frames. Dispose owned geometries, materials, textures and event handlers
on unmount/context loss; React Strict Mode must not duplicate the scene/timelines.

Why R3F: the approved stack is React 19; the official R3F guidance pairs version 9
with React 19. It gives explicit control of asset hosting, draw calls, quality and
reduced-motion fallbacks. Spline remains a viable alternative if the owner prefers
visual scene authoring, but there is no connected Spline authoring tool in this
session and no scene export has been supplied. Do not embed an invented Spline URL
or install both runtimes. No Spline pricing/plan promises are assumed.

After concept approval, evaluate/pin compatible versions of three, @react-three/fiber
(React-19-compatible major), and @types/three. Keep the existing GSAP/Motion
versions unless compatibility evidence requires a change. No Drei, physics,
postprocessing, 3D asset marketplace or extra engine is needed for the first scene.
No new dependency was installed during this planning phase.

## Actual screenshot integration

See screenshot-provenance.json for original paths and SHA-256 hashes. Concept
assets embed original bytes; no recolouring or generated app interfaces.
All existing captures are renderer-test screenshots with demo names/messages.
They document actual UI, not a claim of a photographed two-PC live session.

| Existing source | Use in concepts | Public implementation treatment |
| --- | --- | --- |
| compact-messages-dark.png / light.png | Main real chat screen; original Ember accent. | Replace test prose with a clean capture of the current app using prepared demo conversation content, through the actual renderer. Preserve its real controls. |
| group-dark.png | Real three-member conversation and attachment; user-selected blue accent preserved. | Recapture in the app's orange accent and both themes if a consistent branded public gallery is desired. Do not retint screenshot pixels. |
| network-bento-dark.png | Inspected source only. Has a visible connection-reset toast. | Do not publish it as the clean discovery success frame. Capture a successful reachable-device list without error notifications. |
| expansion-gallery.png | Inspected and rejected for public use: empty image/error toast. | Needs a real image preview and valid attachment capture. Never manufacture one. |

Required clean capture set before public release:
1. Chats: one short outgoing/incoming conversation, delivered state and read state.
2. Groups: a genuine three-member conversation with actual per-recipient delivery.
3. Files: selected file awaiting Send, local upload/preparation phase, sending,
   delivered attachment, and a real image preview. The current UI does not expose
   a reliable remote wire-transfer percentage: use its actual phase labels.
4. Network: actual nearby devices/discovery result; no private LAN details intended
   for publication. Use controlled demo devices and get release approval.
5. Settings: appearance/notifications only if useful in the gallery; no paths,
   personal names, security keys or actual user history.

Screenshots first appear as textures on a physical monitor. Before the viewer
needs to read them, move to a flat HTML image with zoom/fullscreen and a caption.
The app is a Windows desktop product; mobile visitors see product screenshots,
not a fake native mobile messenger. Screenshot tabs use buttons, arrow-key
navigation, visible focus and clear active states. Do not autoplay a carousel.

A screenshot cannot truthfully change message state by tinting ticks in the bitmap.
Use a real captured sequence from the renderer, or label the explanation outside
the screenshot and keep the actual screen static until that sequence is available.
Do not treat a TCP acknowledgement as read confirmation or a group delivery count
as a read receipt. No live connection to the visitor's local network is attempted.

### File limit correction

The pasted brief refers to the old 25 MiB cap. Current source does not impose that
cap: frontend fileQueue validates names and safe non-negative sizes; domain
FileAttachment.Validate accepts non-negative int64 sizes; storage streams to disk;
folder upload explicitly streams bytes without an app size cap. An existing
integration test covers a 26 MiB file beyond the former limit. This phase inspected
that test; it did not rerun desktop tests.

Public wording: 'Share files and folders directly over your local network.'
Do not advertise '25 MiB maximum' or 'unlimited guaranteed'. Disk space, permissions,
network interruptions, compatible peer versions and transfer retry limits still
matter. There is no file-speed, throughput, completion-time or durability guarantee.

Source references in the separate desktop repository:
- frontend/src/services/fileTransfer.ts
- frontend/src/features/messaging/fileQueue.ts
- frontend/src/features/messaging/MessageBubble.tsx
- frontend/src/features/groups/GroupWorkspace.tsx
- backend-go/internal/domain/attachment.go
- backend-go/internal/httpapi/folders.go
- backend-go/internal/storage/attachments.go
- backend-go/internal/integration/attachment_queue_test.go

## Desktop/mobile performance fallbacks

These are proposed budgets and acceptance gates, not measured redesign results.

| Environment | Scene and interaction | Loading / budget target |
| --- | --- | --- |
| Capable desktop, fine pointer, normal motion | One R3F scene with three simple PC meshes, one selected connection sequence, modest pointer depth. No real-time shadows, physics or bloom chain. | Defer 3D chunk until text/logo/poster paint; on-demand rendering. Target <=50 draw calls, <=50k triangles, DPR capped at 1.5, active 50-60fps. Confirm on representative hardware. |
| Tablet/coarse pointer | Simplified camera, no pointer parallax, no pinning. Use step buttons and natural scrolling. | DPR capped at 1; reduce texture resolution, render only on changes. No hovering required. |
| Mobile by default | A lightweight spatial SVG/2.5D network with one short meaningful message path. Show peer -> connection -> receiving preview; same product story, fewer moving objects. | Do not download WebGL runtime by default. No scroll pin. Optional 'Explore in 3D' only on capable devices after explicit request. |
| Save-Data / slow connection / degraded runtime | Optimized local poster plus real screenshots and chapter controls. Connection quality hints are optional signals, not the only detection method. | No automatic 3D download; cap image sizes; quality can be manually lowered. |
| Reduced motion | Static spatial view, no auto camera, travelling particles, parallax, scrubbing or pin. Buttons switch scenes immediately. | Do not load 3D for animation alone. Respect changes while the page is open. |
| WebGL unavailable/lost | Replace the canvas with a matching local poster/SVG; chapter copy and screenshots still work. | Error boundary; avoid retry loops; no empty black rectangle. |
| JavaScript disabled | Server-rendered headline, chapters, links and real screenshots. | No animation-dependent visibility or inaccessible navigation. |

Budget targets: core route JS <=250KB gzip, 3D deferred chunk <=250KB gzip,
first poster <=160KB, each small texture <=180KB, mobile hero image payload <=250KB.
Use independently optimized WebP/AVIF derivatives of approved screenshots; keep
original PNGs as provenance, never stretch/crop away important controls. If budgets
are missed, simplify and choose 2.5D rather than accepting jank. No enforcement
claim can be made until an implementation and representative-device profiling.

LCP <=2.5s, CLS <=0.1 and INP <=200ms are target p75 field metrics, not lab guarantees.
Reserve canvas/image dimensions; render the real DOM text before loading 3D;
prevent theme flashes; keep local fonts and current static export. Pause hidden
scenes and honor page visibility. No autoplay video/audio or external asset-CDN
requests at runtime unless separately reviewed.

## Accessibility and controls

- Native scrolling; skip link and Skip experience control reach the app gallery.
- Canvas imagery is supplementary; semantic DOM headings and captions tell the
  entire story. Keyboard users can select devices/chapters using labelled buttons.
- 44px targets, visible focus, contrast checked in both themes; orange light is
  decorative, never the sole indicator of delivery or selected state.
- Pause/Replay controls are available before animation. Focus does not trigger
  camera motion, and scrolling is never required for access to essential copy.
- No pointer capture, drag-only task, spin controls, fake active network count,
  automatic local discovery or unannounced live-region message spam.
- Keep screenshot captions and state explanations visible on touch devices.

## Proposed implementation files after approval

Reuse the existing local fonts, tokens, SiteHeader, ThemeToggle, Icons and
MobileMenu. Evolve the header to suit the scene without replacing the brand.
Keep page/layout server-rendered and output: export.

- src/components/living-network/LivingNetwork.tsx: small client composition/error
  boundary; owns quality selection, lazy canvas and meaningful fallback.
- src/components/living-network/NetworkCanvas.tsx: R3F renderer only; PC meshes,
  materials, geometry, resource lifetime, viewport quality and invalidation.
- src/components/living-network/NetworkJourney.tsx: scoped GSAP/ScrollTrigger
  timing and plain shared progress state; no competing object writes.
- src/components/living-network/JourneyControls.tsx: Motion-owned DOM controls,
  Pause/Replay, device/chapter selection, keyboard/touch support.
- src/components/living-network/NetworkFallback.tsx: responsive 2.5D poster/SVG,
  useful without WebGL or animation.
- src/components/sections/ProductScreenshots.tsx: accessible real-image tabs,
  captions and full-size/zoom view, with honest captured-state metadata.
- src/content/living-network.ts: verified chapter copy and scene definitions.
- src/content/product-screenshots.ts: provenance and approved export dimensions.
- public/media/living-network/: reviewed, locally hosted image/poster derivatives.
- src/app/page.tsx / globals.css: compose the six-scene journey and release ending.
- package.json/package-lock.json: add only the approved compatible 3D dependencies.

Do not add a runtime backend, server actions, device-trust UI, analytics, form
submission or release version bumps as part of this marketing redesign.

## Verification after implementation

1. Lint, TypeScript and production static export using the existing npm scripts.
2. Chrome/Edge desktop, tablet, 320/375/390px mobile; dark/light and theme changes.
3. Keyboard-only, touch, reduced-motion changes, no JS, WebGL failure/context loss,
   Save-Data/slow network, resize/orientation changes and navigation cleanup.
4. Strict Mode, event listener/timeline cleanup, bounded rendering when offscreen;
   no animation engine contention or stale canvas state after tabs/route changes.
5. Throttled CPU/network trace, route/deferred bundle transfer sizes, draw calls,
   texture memory, frame times and layout shifts. Do not substitute local unthrottled
   timing for field Core Web Vitals.
6. Screenshot-by-screenshot fidelity/provenance review; no fake state transitions,
   sensitive capture data, missing controls or unsupported claims.
7. Verify the actual public Windows release URL/version/date/checksum before
   enabling download. If unavailable, retain an honest release-status destination.

## References consulted

- R3F installation / React version pairing: https://r3f.docs.pmnd.rs/getting-started/installation
- R3F on-demand rendering and scaling: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Motion accessibility: https://motion.dev/docs/react-accessibility

## Approval gate

Review the three hero directions, the six-scene journey, screenshots needing
recapture, the recommended R3F ownership and the default mobile fallback. Approve
one direction or the A+B combination before website/dependency changes. Deployment
remains separately unapproved. Native Figma delivery remains pending quota access;
Canva generation remains pending the widget's owner selection/start action.
