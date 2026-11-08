# Website UI refinement - 8 November 2026

The approved audit identified ambiguous numbering, repeated introductions,
small useful text, clipped horizontal copy and overly active reading pages.
This pass changes only the separate website. Deployment files, public links,
original logos/screenshots and the desktop application are unchanged.

## Layout and components

- Homepage: remove the oversized first-product introduction. Follow the hero
  with five linked chapters: Inside Lymora, Get connected, Work together,
  Know your connection, Get Lymora. Keep existing URL anchors usable.
- SectionLabel: shared chapter typography. Product tabs use names; setup uses
  Step 1-3 so the sequences have distinct purposes.
- ProductExplorer: reuse the actual screenshot tabs on home and the product
  page, with optional chapter labels. Remove the duplicate product cover.
- Navigation: Inside the app and For Windows state the destinations clearly.
  DownloadAction retains the verified-only release gate, including Coming Soon
  on the homepage. No URL, release or support contact is invented.
- Typography: retain local Manrope and DM Sans, reduce oversized display copy,
  enlarge useful small text, and use consistent responsive spacing and sizes.
- Documentation/privacy: still text and a quieter background. Availability and
  release pages have smaller introductions; the footer has a shorter finish.

## Animation ownership and accessibility

HomeScrollMotion owns marked outer wrappers: modest vertical reveals, a line
reveal and reading progress. PageRevealMotion owns words inside marketing
headings, once on entry. It skips reading pages and screenshot dialogs.
ProductExplorer's Motion transition owns its tab panel. No screenshot content
is also animated by the global reveal component. The slogan wraps completely
instead of sliding through a clipping container. No scroll pinning is added.

useScenePreferences observes OS reduced motion, superseding the earlier
always-on exception approved during development. Reduced motion disables
nonessential scroll/word/packet animation, smooth anchor scrolling and the
WebGL import, while preserving original text, SVG devices and tab controls.
The pre-paint script sets the matching root attribute. Runtime preference
changes update it. Existing manual preview/background pause controls remain
for animated mode. Mobile continues to avoid WebGL.

## Validation

Run npm run lint, npm run typecheck, npm run build, npm run verify:export,
node scripts/verify-scene.mjs, and npm run verify:motion after implementation.
The browser harness verifies the actual static export on loopback, applies
prepared headers, records console/missing-asset failures, and stores review
PNGs only in ignored .verification/. The premium UI module replaces assertions
for intentionally retired scrolling/reset behavior; topology, real screenshot
inspection and unavailable release/support checks remain in the harness.
Browser rendering uses headless Edge/software WebGL, not a hardware FPS or
field Core Web Vitals measurement. No deployment, push or commit is performed.

## Final results

- ESLint: passed, no warnings. TypeScript: passed; the final production build
  also reran the TypeScript compiler successfully.
- Production build: passed, 14 generated static pages. Static verification:
  passed, 11 HTML pages, 669 local references, 8 canonical routes, 108 assets.
- Existing scene geometry/route checks: passed.
- Full browser suite: passed in Edge 156, both themes, 320-3840px layout
  containment, all seven secondary routes at mobile/desktop, chapter links,
  reduced motion and live preference changes, packet animation and pauses,
  real screenshot dialogs, keyboard focus/scroll restoration, and unavailable
  download/support states. No console/runtime/hydration errors, missing assets
  or external requests were recorded by the local harness.
- The browser pass found a narrow-screen PC label overflow. Labels now clamp
  to the scene bounds while preserving 44px controls; the final suite covers it.
  The dialog check now awaits React's asynchronous scroll-lock cleanup.
- Full-page review images: .verification/premium-home-dark-full.png and
  .verification/premium-home-light-full.png. Section/mobile captures and the
  measured report are also in ignored .verification/. No source artwork changed.

No known failing checks remain in the executed suite. Real hardware FPS,
field Core Web Vitals, and additional browser engines were not measured.
Changes remain uncommitted for owner review; no deployment or push occurred.

## Owner correction: restore the editorial design and live animation

The owner rejected the smaller number treatment and reduced-motion change.
This section supersedes the earlier layout/motion policy in this document.

SectionHeading now restores the original oversized, low-contrast number to
all five chapters. One reusable component places the number at the left and
the heading/copy at the right on desktop; mobile keeps the large number in
its own compact row. Each index has restrained scroll-linked depth. Word
reveals replay after leaving/re-entering their trigger, with smooth easing.
The slogan remains fully readable and the existing original assets are kept.

Animation again stays on independently of OS reduced motion as explicitly
requested. Manual background and preview pause controls and hidden-tab/
offscreen pauses remain. WebGL capability checks affect only the expensive
hero renderer; the lightweight SVG background now runs on mobile too.

The wallpaper has six perimeter computers and six ring paths, rather than
15 random crossing paths. No connection passes across the center of the
illustration. Orange packets travel continuously, ease into/out of view and
produce a restrained receiver glow. SVG width is capped so background PCs
do not grow excessively on wide screens. The opaque homepage overlay is
removed to keep the live background visible behind the editorial sections.
This is decorative artwork, not a change to the desktop LAN topology.

Earlier verification results describe the previous pass. The current browser
checks now validate large 01-05 headings, six perimeter routes and animation
with OS reduction, as well as mobile SVG motion without WebGL.

Current correction verified: ESLint, production build with TypeScript, static
export/link checks, scene geometry and the complete local browser suite passed.
The browser exercised always-on motion with OS reduction, moving mobile SVG
packets without WebGL, large 01-05 chapter headings, 320-3840px containment,
both themes, all secondary pages, preview controls and original screenshot
dialogs. No console/runtime/hydration errors, missing assets or external
requests were recorded. Full-page captures remain in ignored .verification/.
No deployment, push or commit has been performed.

## Scroll-controlled vertical statement and important paragraph reveals

ScrollStatement gives each phrase its own complete reading hold: Work nearby,
Think together, Keep it local. GSAP owns the inner vertical track; normal page
scrolling advances a timeline with holds between transitions. The component
adds no pinned section or artificial scroll space. Font-size-based row heights
reserve room for descenders; functional offsets recompute after resize/font
loading. The full statement is a stable accessible group label; visual rows
and progress markers are decorative. With JavaScript disabled or when printed,
all three phrases are shown in full. No timer auto-advances the text.

Colors use existing semantic theme tokens: neutral primary text, an ember
orange gradient, and a warm neutral gradient. Light and dark themes derive
colors separately from their existing accent/foreground values. Forced-colors
mode uses CanvasText. The existing live network and large chapters are kept.

PageRevealMotion additionally splits only static chapter summaries, page
introductions and the About callout into lines. Each line reveals with a
small vertical offset and a restrained stagger. autoSplit and onSplit recreate
line groups on responsive reflow/font changes, and return the animation for
SplitText lifecycle cleanup. Dynamic screenshot-tab copy remains owned by
Motion; documentation and privacy paragraphs remain still. No hero paragraph
is given a second animation owner.

Implementation follows the installed GSAP APIs and official documentation:
https://gsap.com/docs/v3/Plugins/SplitText/
https://gsap.com/docs/v3/Plugins/ScrollTrigger/

Regression coverage now measures all three slider reading holds, reverse
scroll, first/last visibility, all phrase widths, mobile holds, completed
paragraph line reveals and accessible paragraph labels. Original screenshot,
network, keyboard and release-availability coverage remains in place.

This addition passed ESLint, production build/TypeScript, static export checks
and the complete browser suite. Browser checks measured all three vertical
reading holds in both themes, reverse scrolling, complete horizontal text fit
from 320-3840px, 320/375px reading holds, paragraph line completion/accessibility,
responsive reflow, existing network animation, screenshot tabs/dialogs and
secondary navigation. No console/runtime/hydration errors, missing assets or
external requests were recorded. Review captures are in ignored .verification/
as premium-statement-0/1/2-dark/light.png. No commit, push or deployment occurred.


## Connected setup story, navigation and footer

The owner requested the dashed LAN route again. ConnectionStory replaces the
old timed wire entrance with a reversible GSAP ScrollTrigger timeline. The
first segment fills before the second as the reader moves through setup;
scrolling upward restores the dashed path. The connector stays below the
header while the three steps pass through the reading area. No page pinning,
scroll hijacking, artificial spacer or timer is added.

The steps are message-shaped panels, rather than cloud-service symbols:
Lymora communicates directly over the LAN. A connected vertical thread, three
numbered nodes and one warm highlighted panel explain the order. The closest
step to the viewport reading position receives aria-current=step. Completed
and upcoming steps retain readable text. CSS handles the subtle color
transitions; GSAP alone owns progress and entry transforms. useGSAP cleanup
removes its triggers on navigation. Namespaced setup-connection-story styles
avoid a legacy global connection-story grid. All content remains available
without JavaScript.

HeaderEdge measures the actual pill with ResizeObserver and draws two thin
SVG strokes around its perimeter. CSS animates the orange trail and soft tip;
there is no JavaScript animation loop. The SVG ignores pointer events and
does not clip the dropdowns. It pauses when the document is hidden, resizes
with the header, and disconnects its observer when removed.

PageIntro gives all seven menu destinations a semantic breadcrumb, clear
current-page text and a restrained accent divider. SectionNavigation is
reused by the product page and documentation: native anchors work without
JavaScript; a passive scroll listener schedules one animation-frame update
and marks the current section. Cleanup removes listeners and queued work.
Reading pages keep their static prose. The footer uses the original
light/dark logo marks, a clear Windows platform label, refined directory
surface and small text/link interactions. No download, support address,
release number or product capability is invented.

The browser regression suite now checks reversible partial/complete wire
fills, exactly one current step during forward and reverse scroll, both
themes, 320/375px layouts, measured header edges, moving beam, unclipped
keyboard menus, footer artwork, breadcrumbs and section navigation. Final
verification and commit results are reported in the task completion message.


Final verification for this pass: npm run lint, npm run build (including
TypeScript and 14 static pages), npm run verify:export (11 HTML pages and
704 local references), node scripts/verify-scene.mjs and npm run verify:motion
all passed. The Edge 156 suite covered 320-3840px layouts, both themes, all
seven secondary routes, forward/reverse setup and vertical text scrolling,
header beam sizing and movement, dropdown keyboard controls, original app
screenshot dialogs, mobile SVG/desktop 3D previews and release availability.
No console/runtime/hydration errors, missing assets or external website
requests were recorded. Visual review caught and fixed a legacy CSS class
collision; an invalid test selector was corrected before the successful run.
The harness uses software WebGL; these results are not a hardware FPS or
field Core Web Vitals benchmark. Captures remain ignored in .verification/.
No desktop, dependency, release, DNS or hosting configuration was changed.
The requested Git operation updates local dev and main; pushing is separate
because the connected Cloudflare project may deploy main automatically.


## Owner correction: normal-flow connector and plain header edge

The connection bar now scrolls normally with the page instead of staying
sticky while the wires fill. Only its positioning and breakpoint offsets
were removed; the reversible fill and three-step story are unchanged.
The header edge beam, its client component, ResizeObserver and CSS keyframes
were removed. The rounded header, normal border and navigation are preserved.
Regression checks now verify that the bar moves with scroll before the fill
completes, and that no header beam is rendered. This supersedes the earlier
sticky-connector and header-beam descriptions above.


## Owner correction: finish the diagram before it scrolls out

The horizontal connector had still inherited the full setup-story scroll
range after becoming non-sticky. ConnectionStory now gives the diagram its
own reversible 82%-to-42% viewport range, finishing both wires while the
entire diagram is visible below the header. The vertical setup thread keeps
its longer range and existing step highlights. No pinning or sticky behavior
is reintroduced. A small diagram caption, separate wrapper, divider and
responsive spacing distinguish the connection diagram from the setup panels.
Browser checks measure complete wire fills while visible, the separation gap
and divider, and unchanged forward/reverse step highlights on desktop/mobile.
